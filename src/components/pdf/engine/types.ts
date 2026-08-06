// ============================================================
// PDF Engine — Shared Types
// ============================================================

// ---------------------------------------------------------------------------
// Page State Machine
// NOT_LOADED → QUEUED → LOADING → RENDERING → READY → CACHED → EVICTED
// ---------------------------------------------------------------------------
export type PageState =
  | "NOT_LOADED"
  | "QUEUED"
  | "LOADING"
  | "RENDERING"
  | "READY"
  | "CACHED"
  | "EVICTED"
  | "ERROR";

// ---------------------------------------------------------------------------
// Render Priority
// ---------------------------------------------------------------------------
export type RenderPriority = 0 | 1 | 2 | 3;
// 0 = current visible page (highest)
// 1 = adjacent to visible in scroll direction
// 2 = adjacent against scroll direction
// 3 = everything else (lowest)

export type ScrollDirection = "down" | "up" | "idle";

// ---------------------------------------------------------------------------
// Page Dimensions (lazily populated)
// ---------------------------------------------------------------------------
export interface PageDimensions {
  width: number;   // natural width at scale 1.0
  height: number;  // natural height at scale 1.0
}

// ---------------------------------------------------------------------------
// Cache Entry — single source of truth for a page slot
// ---------------------------------------------------------------------------
export interface CacheEntry {
  pageNum: number;

  // PDF.js objects
  pageProxy: any | null;           // PDFPageProxy
  canvas: HTMLCanvasElement | null;
  renderTask: any | null;          // RenderTask (has .cancel())
  viewport: any | null;            // PageViewport (physical, zoom×DPR)

  // Rendering context
  scale: number;                   // zoom × devicePixelRatio at render time
  cssWidth: number;                // logical CSS width (zoom × naturalWidth)
  cssHeight: number;               // logical CSS height (zoom × naturalHeight)
  estimatedMemoryBytes: number;    // canvas.width * canvas.height * 4
  lastAccessTime: number;          // Date.now() on last touch

  // State machine
  state: PageState;

  // Retry tracking
  retryCount: number;
  errorMessage: string | null;
}

// ---------------------------------------------------------------------------
// Scheduler Task
// ---------------------------------------------------------------------------
export interface SchedulerTask {
  pageNum: number;
  priority: RenderPriority;
  enqueuedAt: number;
}

// ---------------------------------------------------------------------------
// Telemetry Snapshot (dev-only)
// ---------------------------------------------------------------------------
export interface TelemetrySnapshot {
  firstPageRenderMs: number | null;
  timeToInteractiveMs: number | null;
  avgRenderMs: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  activeRenders: number;
  cancelledRenders: number;
  currentMemoryMB: number;
  peakMemoryMB: number;
  fps: number;
}
