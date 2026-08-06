// ============================================================
// MetadataManager — Lazy per-page dimension cache
// ============================================================
//
// Responsibilities:
//   • Store total page count (set once after document loads)
//   • Lazily load per-page dimensions on first request
//   • Cache dimensions so subsequent calls are synchronous
//   • Never call doc.getPage() for all pages at init time
//
// Correction applied:
//   Do NOT pre-fetch all page dimensions on load.
//   Dimensions are fetched lazily when a page is first scheduled.
//   A placeholder aspect ratio (8.5:11 ≈ portrait A4) is used until
//   the real dimensions are known.
// ============================================================

import type { PageDimensions } from "./types";

// Default placeholder: standard US Letter / A4 portrait
export const PLACEHOLDER_ASPECT_RATIO = 8.5 / 11; // width / height ≈ 0.773

export class MetadataManager {
  private _numPages: number = 0;
  private _dimensionCache = new Map<number, PageDimensions>();
  private _pendingFetches = new Map<number, Promise<PageDimensions>>();
  private _doc: any | null = null;

  // ── Setup ────────────────────────────────────────────────

  initialize(doc: any, numPages: number): void {
    this._doc = doc;
    this._numPages = numPages;
    this._dimensionCache.clear();
    this._pendingFetches.clear();
  }

  reset(): void {
    this._doc = null;
    this._numPages = 0;
    this._dimensionCache.clear();
    this._pendingFetches.clear();
  }

  // ── Accessors ────────────────────────────────────────────

  get numPages(): number {
    return this._numPages;
  }

  /**
   * Return cached dimensions synchronously, or null if not yet loaded.
   */
  getDimensionsSync(pageNum: number): PageDimensions | null {
    return this._dimensionCache.get(pageNum) ?? null;
  }

  /**
   * Return dimensions for a page, fetching lazily if not cached.
   * Deduplicates concurrent requests for the same page.
   */
  async getDimensions(pageNum: number): Promise<PageDimensions> {
    // Cache hit — return immediately
    const cached = this._dimensionCache.get(pageNum);
    if (cached) return cached;

    // Deduplicate: if a fetch is already in-flight, share the promise
    const pending = this._pendingFetches.get(pageNum);
    if (pending) return pending;

    if (!this._doc) {
      return { width: 612, height: 792 }; // fallback: US Letter at 72dpi
    }

    const fetchPromise = this._fetchDimensions(pageNum);
    this._pendingFetches.set(pageNum, fetchPromise);

    try {
      const dims = await fetchPromise;
      this._dimensionCache.set(pageNum, dims);
      return dims;
    } finally {
      this._pendingFetches.delete(pageNum);
    }
  }

  /**
   * Directly store dimensions for a page that already has a fetched proxy.
   * Called by RenderWorker after it obtains the page proxy for rendering.
   */
  storeDimensions(pageNum: number, dims: PageDimensions): void {
    this._dimensionCache.set(pageNum, dims);
  }

  /**
   * Check if dimensions are already cached (synchronous, no fetch).
   */
  hasDimensions(pageNum: number): boolean {
    return this._dimensionCache.has(pageNum);
  }

  // ── Private ──────────────────────────────────────────────

  private async _fetchDimensions(pageNum: number): Promise<PageDimensions> {
    try {
      const page = await this._doc.getPage(pageNum);
      // Get viewport at scale 1.0, rotation 0 — natural dimensions
      const viewport = page.getViewport({ scale: 1.0, rotation: 0 });
      const dims: PageDimensions = {
        width: viewport.width,
        height: viewport.height,
      };
      // IMPORTANT: do NOT call page.cleanup() here.
      // The CacheManager / RenderWorker will reuse this page proxy.
      // Calling cleanup here would force PDF.js to re-fetch the page data.
      return dims;
    } catch (err) {
      console.warn(`[MetadataManager] Failed to get dimensions for page ${pageNum}:`, err);
      // Return placeholder on error — rendering will retry independently
      return { width: 612, height: 792 };
    }
  }
}
