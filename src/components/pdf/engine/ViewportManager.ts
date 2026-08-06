// ============================================================
// ViewportManager — IntersectionObserver-driven virtualization
// ============================================================
//
// Responsibilities:
//   • Create and manage a single IntersectionObserver
//   • Observe sentinel <div> elements for each page
//   • Notify the RenderScheduler when pages enter/leave the viewport
//   • Track scroll direction from page entry/exit events (not scroll events)
//   • Maintain the set of currently visible pages
//   • Trigger preload of pages within the preload margin
//
// Corrections applied:
//   • No scroll event listeners for scheduling decisions
//   • requestAnimationFrame is used ONLY by TelemetryManager for FPS
//   • Scroll direction inferred from which page numbers enter/leave
// ============================================================

import type { ScrollDirection } from "./types";
import type { RenderScheduler } from "./RenderScheduler";

// Pages within this many pixels of the viewport edge will be preloaded.
// Keep this moderate — too large causes burst rendering on large PDFs.
const PRELOAD_MARGIN_PX = 150;

// A page is considered "visible" (for page indicator) when >= 10% is shown.
const VISIBLE_THRESHOLD = 0.1;

export type PageVisibilityCallback = (
  visiblePages: Set<number>,
  direction: ScrollDirection
) => void;

export class ViewportManager {
  private _observer: IntersectionObserver | null = null;
  private _visiblePages = new Set<number>();
  private _scheduler: RenderScheduler;
  private _onVisibilityChange: PageVisibilityCallback;

  // Scroll direction inference
  private _lastMinVisible: number = 1;
  private _scrollDirection: ScrollDirection = "idle";
  private _directionTimer: ReturnType<typeof setTimeout> | null = null;

  // Sentinel elements: pageNum → DOM element
  private _sentinels = new Map<number, Element>();

  constructor(scheduler: RenderScheduler, onVisibilityChange: PageVisibilityCallback) {
    this._scheduler = scheduler;
    this._onVisibilityChange = onVisibilityChange;
  }

  /**
   * Initialize the IntersectionObserver on a scroll container.
   * @param scrollRoot - The scrollable container element (viewerRef)
   */
  initialize(scrollRoot: Element): void {
    this.destroy();

    this._observer = new IntersectionObserver(
      this._handleIntersections.bind(this),
      {
        root: scrollRoot,
        rootMargin: `${PRELOAD_MARGIN_PX}px 0px ${PRELOAD_MARGIN_PX}px 0px`,
        // 0: detect entering/leaving preload zone
        // 0.1: detect when >= 10% is visible (for page indicator)
        threshold: [0, 0.1, 1.0],
      }
    );

    // Re-observe any sentinels that were registered before init
    for (const [, el] of this._sentinels) {
      this._observer.observe(el);
    }
  }

  /**
   * Register a sentinel element for a page.
   * Call this from a React ref callback when the placeholder div mounts.
   */
  observe(pageNum: number, el: Element): void {
    this._sentinels.set(pageNum, el);
    this._observer?.observe(el);
  }

  /**
   * Unregister a sentinel element for a page.
   * Call this when the placeholder div unmounts.
   */
  unobserve(pageNum: number): void {
    const el = this._sentinels.get(pageNum);
    if (el) {
      this._observer?.unobserve(el);
      this._sentinels.delete(pageNum);
    }
    this._visiblePages.delete(pageNum);
  }

  get visiblePages(): Set<number> {
    return new Set(this._visiblePages);
  }

  get scrollDirection(): ScrollDirection {
    return this._scrollDirection;
  }

  /**
   * Imperative scroll-to: update direction hint before scrolling.
   */
  setScrollDirection(dir: ScrollDirection): void {
    this._scrollDirection = dir;
  }

  destroy(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._directionTimer !== null) {
      clearTimeout(this._directionTimer);
      this._directionTimer = null;
    }
    this._visiblePages.clear();
    this._sentinels.clear();
  }

  // ── Private ──────────────────────────────────────────────

  private _handleIntersections(entries: IntersectionObserverEntry[]): void {
    let changed = false;

    for (const entry of entries) {
      const pageNum = this._getPageNum(entry.target);
      if (pageNum === null) continue;

      const inPreloadZone = entry.isIntersecting;
      // "truly visible" = at least 10% of the page is in the viewport
      const isVisible = entry.intersectionRatio >= VISIBLE_THRESHOLD;

      if (inPreloadZone) {
        // Always schedule when entering preload zone
        this._scheduler.schedule(pageNum);

        // Update visible set only when meaningfully visible
        if (isVisible && !this._visiblePages.has(pageNum)) {
          this._visiblePages.add(pageNum);
          changed = true;
        }
      } else {
        if (this._visiblePages.has(pageNum)) {
          this._visiblePages.delete(pageNum);
          changed = true;
        }
      }
    }

    if (changed) {
      this._updateScrollDirection();
      this._onVisibilityChange(new Set(this._visiblePages), this._scrollDirection);
      this._scheduler.updateVisible(new Set(this._visiblePages), this._scrollDirection);
    }
  }

  /**
   * Infer scroll direction from which page is the new minimum visible.
   * If minimum visible page number increased → scrolling down.
   * If decreased → scrolling up.
   */
  private _updateScrollDirection(): void {
    if (this._visiblePages.size === 0) return;

    const minVisible = Math.min(...Array.from(this._visiblePages));

    if (minVisible > this._lastMinVisible) {
      this._scrollDirection = "down";
    } else if (minVisible < this._lastMinVisible) {
      this._scrollDirection = "up";
    }
    // else: idle (no change)

    this._lastMinVisible = minVisible;

    // Reset to idle after brief pause (user stopped scrolling)
    if (this._directionTimer !== null) {
      clearTimeout(this._directionTimer);
    }
    this._directionTimer = setTimeout(() => {
      this._scrollDirection = "idle";
      this._directionTimer = null;
    }, 300);
  }

  private _getPageNum(el: Element): number | null {
    for (const [pageNum, sentinel] of this._sentinels) {
      if (sentinel === el) return pageNum;
    }
    // Fallback: read data attribute
    const attr = (el as HTMLElement).dataset?.page;
    return attr ? parseInt(attr, 10) : null;
  }
}
