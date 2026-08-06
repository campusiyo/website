// ============================================================
// RenderScheduler — Priority-aware render queue
// ============================================================
//
// Responsibilities:
//   • Maintain a priority queue of render requests
//   • Execute up to MAX_CONCURRENT_RENDERS simultaneous renders
//   • Prioritize based on: visibility, scroll direction, distance
//   • Cancel obsolete tasks when the user jumps to a distant page
//   • Retry failed pages once before marking as ERROR
//   • Integrate with CacheManager and RenderWorker
//
// Priority scoring:
//   0 = currently visible (highest)
//   1 = next in scroll direction (adjacent)
//   2 = previous (against scroll direction)
//   3 = preload buffer (distance 2–3 from visible)
//   Higher score = lower priority (dropped first)
//
// Corrections applied:
//   • NO scroll event frequency detection
//   • IntersectionObserver notifies this scheduler
//   • Priority recomputed on every queue drain cycle
//   • Jump to distant page: cancel all non-visible tasks immediately
// ============================================================

import type { RenderPriority, ScrollDirection } from "./types";
import type { CacheManager } from "./CacheManager";
import type { RenderWorker } from "./RenderWorker";
import type { TelemetryManager } from "./TelemetryManager";

const MAX_CONCURRENT_RENDERS = 2;

export type RenderCompleteCallback = (pageNum: number, success: boolean) => void;

interface QueueItem {
  pageNum: number;
  priority: RenderPriority;
  enqueuedAt: number;
}

export interface SchedulerContext {
  zoom: number;
  rotation: number;
  containerWidth: number; // available CSS px — used to compute scale in RenderWorker
}

export class RenderScheduler {
  private _queue: QueueItem[] = [];
  private _activeRenders = new Set<number>();
  private _cancelledCount = 0;

  private _cache: CacheManager;
  private _worker: RenderWorker;
  private _telemetry: TelemetryManager | null;
  private _onComplete: RenderCompleteCallback;

  // Viewport state (updated by ViewportManager)
  private _visiblePages = new Set<number>();
  private _scrollDirection: ScrollDirection = "idle";
  private _currentPage: number = 1;

  // Zoom / rotation context
  private _ctx: SchedulerContext = { zoom: 1, rotation: 0, containerWidth: 0 };

  // Canvas pool: reuse canvases to avoid GC pressure
  private _canvasPool: HTMLCanvasElement[] = [];

  constructor(
    cache: CacheManager,
    worker: RenderWorker,
    telemetry: TelemetryManager | null,
    onComplete: RenderCompleteCallback
  ) {
    this._cache = cache;
    this._worker = worker;
    this._telemetry = telemetry;
    this._onComplete = onComplete;
  }

  // ── Viewport state updates (called by ViewportManager) ──

  updateVisible(visiblePages: Set<number>, scrollDirection: ScrollDirection): void {
    const prevPage = this._currentPage;
    this._visiblePages = visiblePages;
    this._scrollDirection = scrollDirection;

    // Determine primary visible page (smallest page number in viewport)
    if (visiblePages.size > 0) {
      this._currentPage = Math.min(...Array.from(visiblePages));
    }

    // If user jumped to a distant page, cancel all queued non-visible tasks
    const jumpDistance = Math.abs(this._currentPage - prevPage);
    if (jumpDistance > 3) {
      this._cancelNonVisibleQueued();
    }

    // Re-sort queue with updated priorities
    this._sortQueue();
    this._drain();
  }

  updateContext(ctx: SchedulerContext): void {
    this._ctx = ctx;
  }

  // ── Scheduling API ───────────────────────────────────────

  /**
   * Request rendering of a page. If already rendered/queued/active, no-op.
   * Priority is computed automatically based on current viewport state.
   */
  schedule(pageNum: number): void {
    const entry = this._cache.peek(pageNum);

    // Skip if already done or in progress
    if (entry) {
      const { state } = entry;
      if (state === "READY" || state === "CACHED" || state === "QUEUED" ||
          state === "LOADING" || state === "RENDERING") {
        return;
      }
    }

    // Skip if already active
    if (this._activeRenders.has(pageNum)) return;

    // Skip if already in queue
    if (this._queue.some(q => q.pageNum === pageNum)) return;

    const priority = this._computePriority(pageNum);

    this._queue.push({
      pageNum,
      priority,
      enqueuedAt: Date.now(),
    });

    // Mark in cache as queued
    const cacheEntry = this._cache.getOrCreate(pageNum);
    cacheEntry.state = "QUEUED";

    this._sortQueue();
    this._drain();
  }

  /**
   * Cancel a specific page render.
   * If currently rendering, cancels the PDF.js task.
   * If queued, removes from queue.
   */
  cancel(pageNum: number): void {
    // Remove from queue
    const idx = this._queue.findIndex(q => q.pageNum === pageNum);
    if (idx !== -1) {
      this._queue.splice(idx, 1);
      this._cache.setState(pageNum, "NOT_LOADED");
      this._cancelledCount++;
      this._telemetry?.recordCancel();
    }

    // Cancel active render
    const entry = this._cache.peek(pageNum);
    if (entry?.renderTask) {
      try { entry.renderTask.cancel(); } catch (_) {}
      entry.renderTask = null;
      this._cache.setState(pageNum, "NOT_LOADED");
      this._activeRenders.delete(pageNum);
      this._cancelledCount++;
      this._telemetry?.recordCancel();
    }
  }

  /**
   * Cancel all renders for pages not in the given set.
   * Used when the user jumps to a distant page.
   */
  cancelAllExcept(keepPages: Set<number>): void {
    // Cancel queued
    this._queue = this._queue.filter(item => {
      if (keepPages.has(item.pageNum)) return true;
      this._cache.setState(item.pageNum, "NOT_LOADED");
      this._cancelledCount++;
      this._telemetry?.recordCancel();
      return false;
    });

    // Cancel active
    for (const pageNum of this._activeRenders) {
      if (!keepPages.has(pageNum)) {
        const entry = this._cache.peek(pageNum);
        if (entry?.renderTask) {
          try { entry.renderTask.cancel(); } catch (_) {}
          entry.renderTask = null;
        }
        this._cache.setState(pageNum, "NOT_LOADED");
        this._activeRenders.delete(pageNum);
        this._cancelledCount++;
        this._telemetry?.recordCancel();
      }
    }
  }

  /** Hard stop: cancel everything. */
  cancelAll(): void {
    this.cancelAllExcept(new Set());
    this._queue = [];
  }

  get activeCount(): number {
    return this._activeRenders.size;
  }

  get cancelledCount(): number {
    return this._cancelledCount;
  }

  // ── Private ──────────────────────────────────────────────

  /**
   * Drain the queue: start renders up to MAX_CONCURRENT_RENDERS.
   */
  private _drain(): void {
    while (
      this._activeRenders.size < MAX_CONCURRENT_RENDERS &&
      this._queue.length > 0
    ) {
      const item = this._queue.shift()!;
      this._startRender(item.pageNum);
    }
  }

  private async _startRender(pageNum: number): Promise<void> {
    this._activeRenders.add(pageNum);
    this._telemetry?.recordStart();

    const entry = this._cache.getOrCreate(pageNum);
    const { zoom, rotation, containerWidth } = this._ctx;

    // ── prepare() ──
    const prepareResult = await this._worker.prepare(entry, zoom, rotation, containerWidth);
    if (!prepareResult) {
      // prepare() failed — handle error
      this._handleFailure(pageNum, entry, "prepare");
      return;
    }

    // ── Acquire canvas ──
    const canvas = this._acquireCanvas();

    // ── render() ──
    const success = await this._worker.render(entry, canvas, prepareResult);

    if (success) {
      // Store updated entry (with canvas and memory estimate)
      this._cache.set(entry);
      this._activeRenders.delete(pageNum);
      this._telemetry?.recordComplete();
      this._onComplete(pageNum, true);
    } else if (entry.state === "ERROR" || entry.errorMessage) {
      this._handleFailure(pageNum, entry, "render");
    } else {
      // Cancelled — return canvas to pool
      this._returnCanvas(canvas);
      this._activeRenders.delete(pageNum);
    }

    // Advance the queue
    this._drain();
  }

  private _handleFailure(pageNum: number, entry: any, phase: string): void {
    this._activeRenders.delete(pageNum);

    if (entry.retryCount < 1) {
      // Retry once
      entry.retryCount++;
      entry.state = "NOT_LOADED";
      entry.errorMessage = null;
      console.warn(`[RenderScheduler] Retrying page ${pageNum} (phase: ${phase})`);
      this.schedule(pageNum);
    } else {
      // Second failure — mark as permanent error
      entry.state = "ERROR";
      this._telemetry?.recordComplete();
      this._onComplete(pageNum, false);
      console.error(`[RenderScheduler] Page ${pageNum} failed permanently after retry.`);
    }

    this._drain();
  }

  /**
   * Compute priority for a page based on current viewport state.
   *
   * Priority 0 = visible (highest)
   * Priority 1 = adjacent in scroll direction
   * Priority 2 = adjacent against scroll direction
   * Priority 3 = preload buffer / rest
   */
  private _computePriority(pageNum: number): RenderPriority {
    if (this._visiblePages.has(pageNum)) return 0;

    const distance = pageNum - this._currentPage;
    const absDistance = Math.abs(distance);

    if (this._scrollDirection === "down") {
      if (distance === 1) return 1;   // next page (scroll direction)
      if (distance === -1) return 2;  // previous page (behind)
    } else if (this._scrollDirection === "up") {
      if (distance === -1) return 1;  // next in up-scroll direction
      if (distance === 1) return 2;   // previous page (behind)
    } else {
      // Idle: symmetric
      if (absDistance === 1) return 1;
    }

    if (absDistance <= 3) return 3;
    return 3; // lowest
  }

  private _sortQueue(): void {
    // Re-compute priorities based on current viewport state
    for (const item of this._queue) {
      item.priority = this._computePriority(item.pageNum);
    }

    // Sort: lowest priority number = highest urgency = front of queue
    this._queue.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      // Tie-break: earlier enqueue time
      return a.enqueuedAt - b.enqueuedAt;
    });
  }

  private _cancelNonVisibleQueued(): void {
    this._queue = this._queue.filter(item => {
      if (this._visiblePages.has(item.pageNum)) return true;
      this._cache.setState(item.pageNum, "NOT_LOADED");
      this._cancelledCount++;
      this._telemetry?.recordCancel();
      return false;
    });
  }

  // ── Canvas pool ──────────────────────────────────────────
  // Reusing canvas elements avoids repeated GPU texture allocation

  private _acquireCanvas(): HTMLCanvasElement {
    const pooled = this._canvasPool.pop();
    if (pooled) return pooled;
    return document.createElement("canvas");
  }

  private _returnCanvas(canvas: HTMLCanvasElement): void {
    // Clear and return to pool (limit pool size to avoid memory hoarding)
    if (this._canvasPool.length < 4) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      this._canvasPool.push(canvas);
    }
  }

  destroy(): void {
    this.cancelAll();
    this._canvasPool = [];
  }
}
