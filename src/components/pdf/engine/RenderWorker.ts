// ============================================================
// RenderWorker — Canvas rendering pipeline with lifecycle
// ============================================================
//
// Responsibilities:
//   • prepare()  — acquire PDFPageProxy, compute responsive scale + viewport
//   • render()   — execute canvas render pipeline onto a <canvas> element
//   • cleanup()  — cancel task, release proxy
//
// ── Responsive Scale Formula ─────────────────────────────────────────────────
//
//   fitScale      = min(1.0, containerWidth / naturalPageWidth)
//   effectiveScale = fitScale × zoom
//
//   Properties:
//     • At zoom = 1.0 (default):
//         Desktop (container > naturalWidth):  fitScale = 1.0, page = natural size
//         Mobile  (container < naturalWidth):  fitScale < 1.0, page fits screen exactly
//     • At zoom > 1.0 (user zoomed in):
//         effectiveScale > fitScale, canvas grows beyond naturalWidth
//         → parent scroll container shows horizontal scrollbar (intended behavior)
//     • Auto-upscaling: NEVER (fitScale capped at 1.0 on desktop)
//     • Horizontal overflow at default zoom: IMPOSSIBLE (fitScale × 1.0 ≤ 1.0)
//
// ── Canvas Sizing Contract ────────────────────────────────────────────────────
//
//   canvas.width  = floor(effectiveScale × dpr × naturalWidth)   physical pixels
//   canvas.height = floor(effectiveScale × dpr × naturalHeight)  physical pixels
//   canvas.style.width  = ceil(effectiveScale × naturalWidth)    logical CSS px
//   canvas.style.height = ceil(effectiveScale × naturalHeight)   logical CSS px
//
//   The page card container wraps the canvas — never constrains it.
//   No aspectRatio. No maxWidth. No overflow:hidden on wrapper.
//
// ── Retry Behaviour ───────────────────────────────────────────────────────────
//   • First failure: retry once
//   • Second failure: state = ERROR, error placeholder shown
//   • Never crashes the document — remaining pages continue
// ============================================================

import type { CacheEntry } from "./types";
import type { CacheManager } from "./CacheManager";
import type { MetadataManager } from "./MetadataManager";
import type { TelemetryManager } from "./TelemetryManager";

export interface RenderWorkerOptions {
  doc: any;                  // PDFDocumentProxy
  cache: CacheManager;
  metadata: MetadataManager;
  telemetry: TelemetryManager | null;
  devicePixelRatio: number;
}

export interface PrepareResult {
  pageProxy: any;     // PDFPageProxy
  viewport: any;      // PageViewport at effectiveScale × dpr (physical resolution)
  scale: number;      // effectiveScale × dpr
  cssWidth: number;   // effectiveScale × naturalWidth  (logical CSS pixels)
  cssHeight: number;  // effectiveScale × naturalHeight (logical CSS pixels)
}

export class RenderWorker {
  private _doc: any;
  private _cache: CacheManager;
  private _metadata: MetadataManager;
  private _telemetry: TelemetryManager | null;
  private _dpr: number;

  constructor(options: RenderWorkerOptions) {
    this._doc      = options.doc;
    this._cache    = options.cache;
    this._metadata = options.metadata;
    this._telemetry = options.telemetry;
    this._dpr      = options.devicePixelRatio;
  }

  // ── prepare() ─────────────────────────────────────────────────────────────
  /**
   * Acquire PDFPageProxy and compute the responsive rendering scale.
   *
   * Scale derivation:
   *   naturalWidth  = page width at scale=1.0 (PDF user-space units, ≈ points)
   *   fitScale      = min(1.0, containerWidth / naturalWidth)
   *   effectiveScale = fitScale × zoom
   *
   *   When containerWidth = 0 (not yet measured), falls back to:
   *   effectiveScale = zoom (will be re-rendered after ResizeObserver fires)
   *
   * Rotation note: 90°/270° rotations swap width↔height of the natural viewport.
   *
   * Updates entry state: NOT_LOADED → LOADING
   */
  async prepare(
    entry: CacheEntry,
    zoom: number,
    rotation: number,
    containerWidth: number
  ): Promise<PrepareResult | null> {
    entry.state = "LOADING";

    try {
      // Reuse proxy if already fetched — avoids extra network round-trip
      let pageProxy = entry.pageProxy;
      if (!pageProxy) {
        pageProxy = await this._doc.getPage(entry.pageNum);
        entry.pageProxy = pageProxy;
      }

      // ── Natural viewport (scale=1, no rotation) ──────────────────────────
      // Used only to extract the page's intrinsic dimensions for scale math.
      const naturalViewport = pageProxy.getViewport({ scale: 1.0, rotation: 0 });

      // Cache dimensions lazily — RenderWorker is the only caller of getPage()
      if (!this._metadata.hasDimensions(entry.pageNum)) {
        this._metadata.storeDimensions(entry.pageNum, {
          width:  naturalViewport.width,
          height: naturalViewport.height,
        });
      }

      // ── Determine effective natural width after rotation ──────────────────
      // PDF.js getViewport({ scale, rotation }) swaps width/height for 90°/270°.
      // We need the dimension that maps to the horizontal axis post-rotation
      // to compute the correct fit scale.
      const isLandscapeRotation = rotation === 90 || rotation === 270;
      const effectiveNaturalW   = isLandscapeRotation
        ? naturalViewport.height
        : naturalViewport.width;

      // ── Responsive scale ──────────────────────────────────────────────────
      //
      //   fitScale       = min(1.0, containerWidth / effectiveNaturalW)
      //   effectiveScale = fitScale × zoom
      //
      // At zoom=1.0: effectiveScale = fitScale ≤ 1.0 → never overflows container
      // At zoom>1.0: effectiveScale > fitScale → may overflow (horizontal scroll OK)
      // containerWidth=0: fallback to zoom directly (will re-render after measure)
      let effectiveScale: number;

      if (containerWidth > 0) {
        const fitScale     = Math.min(1.0, containerWidth / effectiveNaturalW);
        effectiveScale     = fitScale * zoom;
      } else {
        // Fallback: use zoom directly. First render may overflow on narrow screens.
        // ResizeObserver will update containerWidth and trigger a re-render.
        effectiveScale = zoom;
      }

      // ── CSS viewport — at effectiveScale (logical pixels) ────────────────
      // This is the size the canvas occupies in the layout (style.width/height).
      const cssViewport = pageProxy.getViewport({ scale: effectiveScale, rotation });
      const cssWidth    = cssViewport.width;
      const cssHeight   = cssViewport.height;

      // ── Physical viewport — at effectiveScale × DPR ──────────────────────
      // PDF.js renders at this resolution into the canvas backing store.
      // Retina: backing store is 2× CSS pixels — vectors/text stay sharp.
      const physicalViewport = pageProxy.getViewport({
        scale:    effectiveScale * this._dpr,
        rotation,
      });

      entry.viewport = physicalViewport;
      entry.scale    = effectiveScale * this._dpr;

      return {
        pageProxy,
        viewport:  physicalViewport,
        scale:     effectiveScale * this._dpr,
        cssWidth,
        cssHeight,
      };
    } catch (err) {
      console.error(`[RenderWorker] prepare() failed for page ${entry.pageNum}:`, err);
      entry.state        = "ERROR";
      entry.errorMessage = String(err);
      return null;
    }
  }

  // ── render() ──────────────────────────────────────────────────────────────
  /**
   * Render the page onto a canvas element.
   *
   * Canvas sizing contract (strictly enforced):
   *   canvas.width         = floor(physicalViewport.width)   backing store px
   *   canvas.height        = floor(physicalViewport.height)
   *   canvas.style.width   = ceil(cssWidth) + "px"          display px (logical)
   *   canvas.style.height  = ceil(cssHeight) + "px"
   *
   * The canvas sets its own display size. The container wraps it.
   * No CSS constrains the canvas from outside.
   *
   * Returns true on success, false on cancellation or failure.
   */
  async render(
    entry: CacheEntry,
    canvas: HTMLCanvasElement,
    prepareResult: PrepareResult
  ): Promise<boolean> {
    const { pageProxy, viewport, cssWidth, cssHeight } = prepareResult;

    entry.state = "RENDERING";

    const startTime = performance.now();

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get 2D canvas context");

      // ── Resize backing store ──────────────────────────────────────────────
      // Must happen BEFORE any ctx operations — assignment resets the canvas.
      const physicalW = Math.floor(viewport.width);
      const physicalH = Math.floor(viewport.height);
      canvas.width  = physicalW;
      canvas.height = physicalH;

      // ── Set CSS display dimensions ────────────────────────────────────────
      // cssWidth/cssHeight are already in logical (CSS) pixels from getViewport.
      // No DPR division required here.
      canvas.style.width    = `${Math.ceil(cssWidth)}px`;
      canvas.style.height   = `${Math.ceil(cssHeight)}px`;
      canvas.style.display  = "block";
      canvas.style.imageRendering = "auto";

      // Persist CSS dims on entry so PdfViewer can size the placeholder
      entry.cssWidth              = Math.ceil(cssWidth);
      entry.cssHeight             = Math.ceil(cssHeight);
      entry.estimatedMemoryBytes  = physicalW * physicalH * 4;

      // ── Clear to white ────────────────────────────────────────────────────
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, physicalW, physicalH);

      // ── PDF.js render ─────────────────────────────────────────────────────
      const renderTask = pageProxy.render({
        canvasContext: ctx,
        viewport,
        intent: "display",
      });

      entry.renderTask = renderTask;
      entry.canvas     = canvas;

      await renderTask.promise;

      // ── Success ───────────────────────────────────────────────────────────
      entry.renderTask     = null;
      entry.state          = "READY";
      entry.lastAccessTime = Date.now();

      this._telemetry?.recordRender(performance.now() - startTime, entry.pageNum);

      return true;

    } catch (err: any) {
      if (err?.name === "RenderingCancelledException") {
        entry.renderTask = null;
        return false; // normal cancellation, not an error
      }
      console.error(`[RenderWorker] render() failed for page ${entry.pageNum}:`, err);
      entry.renderTask   = null;
      entry.errorMessage = String(err);
      return false;
    }
  }

  // ── cleanup() ─────────────────────────────────────────────────────────────
  /**
   * Cancel any active render task and release PDF.js internal page resources.
   * Does NOT clear the canvas — visual persists until new render replaces it.
   */
  cleanup(entry: CacheEntry): void {
    if (entry.renderTask) {
      try { entry.renderTask.cancel(); } catch (_) {}
      entry.renderTask = null;
    }
    if (entry.pageProxy) {
      try { entry.pageProxy.cleanup(); } catch (_) {}
      entry.pageProxy = null;
    }
  }
}
