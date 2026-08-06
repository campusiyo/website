// ============================================================
// TelemetryManager — Development-only performance telemetry
// ============================================================
//
// Active ONLY when process.env.NODE_ENV === 'development'.
// In production builds, all methods are no-ops.
//
// Tracks:
//   • First Page Render Time
//   • Time To Interactive
//   • Average Render Time
//   • Cache Hit Rate / Miss Rate
//   • Active Renders
//   • Cancelled Renders
//   • Current Memory Usage
//   • Peak Memory Usage
//   • FPS (via requestAnimationFrame loop)
// ============================================================

import type { TelemetrySnapshot } from "./types";

const IS_DEV = process.env.NODE_ENV === "development";
const LOG_INTERVAL_MS = 5000;

export class TelemetryManager {
  private _firstPageRenderMs: number | null = null;
  private _ttiMs: number | null = null;
  private _renderTimes: number[] = [];
  private _activeRenders: number = 0;
  private _cancelledRenders: number = 0;
  private _peakMemoryBytes: number = 0;

  // FPS tracking
  private _fps: number = 0;
  private _frameCount: number = 0;
  private _lastFpsTime: number = 0;
  private _rafHandle: number | null = null;

  // Log interval
  private _logTimer: ReturnType<typeof setInterval> | null = null;

  // External references for live readings
  private _getCacheHits: (() => number) | null = null;
  private _getCacheMisses: (() => number) | null = null;
  private _getMemoryBytes: (() => number) | null = null;

  private _startTime: number = performance.now();

  constructor() {
    if (!IS_DEV) return;
    this._startFpsLoop();
    this._startLogInterval();
  }

  // ── Setup ────────────────────────────────────────────────

  connect(
    getCacheHits: () => number,
    getCacheMisses: () => number,
    getMemoryBytes: () => number
  ): void {
    if (!IS_DEV) return;
    this._getCacheHits = getCacheHits;
    this._getCacheMisses = getCacheMisses;
    this._getMemoryBytes = getMemoryBytes;
  }

  // ── Recording API ────────────────────────────────────────

  recordRender(durationMs: number, pageNum: number): void {
    if (!IS_DEV) return;
    this._activeRenders = Math.max(0, this._activeRenders - 1);
    this._renderTimes.push(durationMs);

    if (this._firstPageRenderMs === null) {
      this._firstPageRenderMs = performance.now() - this._startTime;
      console.info(`[Telemetry] 🚀 First page render (page ${pageNum}): ${this._firstPageRenderMs.toFixed(0)}ms`);
    }
  }

  recordStart(): void {
    if (!IS_DEV) return;
    this._activeRenders++;
  }

  recordComplete(): void {
    if (!IS_DEV) return;
    this._activeRenders = Math.max(0, this._activeRenders - 1);

    if (this._ttiMs === null && this._activeRenders === 0 && this._renderTimes.length > 0) {
      this._ttiMs = performance.now() - this._startTime;
    }
  }

  recordCancel(): void {
    if (!IS_DEV) return;
    this._cancelledRenders++;
    this._activeRenders = Math.max(0, this._activeRenders - 1);
  }

  // ── Snapshot ─────────────────────────────────────────────

  getSnapshot(): TelemetrySnapshot {
    const hits = this._getCacheHits?.() ?? 0;
    const misses = this._getCacheMisses?.() ?? 0;
    const total = hits + misses;
    const memBytes = this._getMemoryBytes?.() ?? 0;

    this._peakMemoryBytes = Math.max(this._peakMemoryBytes, memBytes);

    const avgRender =
      this._renderTimes.length > 0
        ? this._renderTimes.reduce((a, b) => a + b, 0) / this._renderTimes.length
        : 0;

    return {
      firstPageRenderMs: this._firstPageRenderMs,
      timeToInteractiveMs: this._ttiMs,
      avgRenderMs: avgRender,
      cacheHits: hits,
      cacheMisses: misses,
      cacheHitRate: total > 0 ? hits / total : 0,
      activeRenders: this._activeRenders,
      cancelledRenders: this._cancelledRenders,
      currentMemoryMB: memBytes / (1024 * 1024),
      peakMemoryMB: this._peakMemoryBytes / (1024 * 1024),
      fps: this._fps,
    };
  }

  // ── Cleanup ──────────────────────────────────────────────

  destroy(): void {
    if (this._rafHandle !== null) {
      cancelAnimationFrame(this._rafHandle);
      this._rafHandle = null;
    }
    if (this._logTimer !== null) {
      clearInterval(this._logTimer);
      this._logTimer = null;
    }
  }

  // ── Private ──────────────────────────────────────────────

  private _startFpsLoop(): void {
    this._lastFpsTime = performance.now();
    const tick = (now: number) => {
      this._frameCount++;
      const elapsed = now - this._lastFpsTime;
      if (elapsed >= 1000) {
        this._fps = Math.round((this._frameCount / elapsed) * 1000);
        this._frameCount = 0;
        this._lastFpsTime = now;
      }
      this._rafHandle = requestAnimationFrame(tick);
    };
    this._rafHandle = requestAnimationFrame(tick);
  }

  private _startLogInterval(): void {
    this._logTimer = setInterval(() => {
      const snap = this.getSnapshot();
      console.table({
        "First Page Render": snap.firstPageRenderMs != null ? `${snap.firstPageRenderMs.toFixed(0)}ms` : "—",
        "Time to Interactive": snap.timeToInteractiveMs != null ? `${snap.timeToInteractiveMs.toFixed(0)}ms` : "—",
        "Avg Render Time": `${snap.avgRenderMs.toFixed(0)}ms`,
        "Cache Hit Rate": `${(snap.cacheHitRate * 100).toFixed(1)}%`,
        "Cache Hits": snap.cacheHits,
        "Cache Misses": snap.cacheMisses,
        "Active Renders": snap.activeRenders,
        "Cancelled Renders": snap.cancelledRenders,
        "Current Memory": `${snap.currentMemoryMB.toFixed(1)} MB`,
        "Peak Memory": `${snap.peakMemoryMB.toFixed(1)} MB`,
        "FPS": snap.fps,
      });
    }, LOG_INTERVAL_MS);
  }
}
