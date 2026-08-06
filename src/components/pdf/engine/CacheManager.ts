// ============================================================
// CacheManager — Adaptive LRU page cache with memory budgeting
// ============================================================
//
// Responsibilities:
//   • Maintain an ordered LRU map of CacheEntry objects
//   • Enforce device-adaptive cache size (mobile=4, tablet=6, desktop=10)
//   • Track estimated canvas memory per entry (W × H × 4 bytes)
//   • Enforce memory budget (mobile=40MB, tablet=80MB, desktop=120MB)
//   • Evict LRU entries when budget exceeded
//   • Call page.cleanup() and release canvas on eviction
//   • Expose touch(), get(), set(), evict(), clear()
// ============================================================

import type { CacheEntry, PageState } from "./types";

export interface CacheConfig {
  maxPages: number;
  maxMemoryBytes: number;
}

function getDeviceConfig(): CacheConfig {
  if (typeof window === "undefined") {
    return { maxPages: 10, maxMemoryBytes: 120 * 1024 * 1024 };
  }
  const w = window.innerWidth;
  if (w < 768) {
    return { maxPages: 4, maxMemoryBytes: 40 * 1024 * 1024 };   // Mobile
  } else if (w < 1024) {
    return { maxPages: 6, maxMemoryBytes: 80 * 1024 * 1024 };   // Tablet
  }
  return { maxPages: 10, maxMemoryBytes: 120 * 1024 * 1024 };   // Desktop
}

export function createEmptyCacheEntry(pageNum: number): CacheEntry {
  return {
    pageNum,
    pageProxy: null,
    canvas: null,
    renderTask: null,
    viewport: null,
    scale: 1,
    cssWidth: 0,
    cssHeight: 0,
    estimatedMemoryBytes: 0,
    lastAccessTime: Date.now(),
    state: "NOT_LOADED",
    retryCount: 0,
    errorMessage: null,
  };
}

export class CacheManager {
  // Insertion order == LRU order (last inserted = most recently used)
  private _cache = new Map<number, CacheEntry>();
  private _config: CacheConfig;
  private _totalMemoryBytes: number = 0;

  // Telemetry
  public hits: number = 0;
  public misses: number = 0;

  constructor() {
    this._config = getDeviceConfig();
  }

  /** Refresh device config (call on resize). */
  reconfigure(): void {
    this._config = getDeviceConfig();
  }

  get totalMemoryBytes(): number {
    return this._totalMemoryBytes;
  }

  get config(): CacheConfig {
    return this._config;
  }

  // ── Entry access ────────────────────────────────────────

  /** Get a cache entry without promoting to MRU. */
  peek(pageNum: number): CacheEntry | undefined {
    return this._cache.get(pageNum);
  }

  /**
   * Get a cache entry and promote it to MRU position.
   * Records a cache hit if the entry is in READY/CACHED state.
   */
  touch(pageNum: number): CacheEntry | undefined {
    const entry = this._cache.get(pageNum);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Promote to MRU: delete + re-insert
    this._cache.delete(pageNum);
    entry.lastAccessTime = Date.now();
    this._cache.set(pageNum, entry);

    if (entry.state === "READY" || entry.state === "CACHED") {
      this.hits++;
    }

    return entry;
  }

  /**
   * Set or update a cache entry.
   * If this is a new entry, potentially evict LRU pages to make room.
   */
  set(entry: CacheEntry): void {
    const isNew = !this._cache.has(entry.pageNum);

    // Update memory accounting
    if (!isNew) {
      const old = this._cache.get(entry.pageNum)!;
      this._totalMemoryBytes -= old.estimatedMemoryBytes;
    }

    this._totalMemoryBytes += entry.estimatedMemoryBytes;
    this._cache.set(entry.pageNum, entry);

    if (isNew) {
      this._enforceCapacity();
    }
    this._enforceMemoryBudget();
  }

  /**
   * Ensure an entry exists for this page (creating it if absent).
   * Returns the existing or newly-created entry.
   */
  getOrCreate(pageNum: number): CacheEntry {
    const existing = this._cache.get(pageNum);
    if (existing) return existing;

    const entry = createEmptyCacheEntry(pageNum);
    this._cache.set(pageNum, entry);
    return entry;
  }

  /** Update the state of an existing entry in-place. */
  setState(pageNum: number, state: PageState): void {
    const entry = this._cache.get(pageNum);
    if (entry) {
      entry.state = state;
    }
  }

  /** Check whether a page is in any in-progress state. */
  isRendering(pageNum: number): boolean {
    const entry = this._cache.get(pageNum);
    return entry?.state === "QUEUED" || entry?.state === "LOADING" || entry?.state === "RENDERING";
  }

  /** Number of entries currently in the cache. */
  get size(): number {
    return this._cache.size;
  }

  /** All page numbers currently in cache. */
  get pageNums(): number[] {
    return Array.from(this._cache.keys());
  }

  // ── Eviction ────────────────────────────────────────────

  /**
   * Evict a specific page regardless of LRU order.
   * Used by the scheduler when the user jumps far away.
   */
  evict(pageNum: number): void {
    const entry = this._cache.get(pageNum);
    if (!entry) return;
    this._evictEntry(entry);
    this._cache.delete(pageNum);
  }

  /**
   * Evict all entries whose state is READY or CACHED
   * and that are not in the provided keep-set.
   */
  evictExcept(keepPages: Set<number>): void {
    for (const [pageNum, entry] of this._cache) {
      if (keepPages.has(pageNum)) continue;
      if (entry.state === "READY" || entry.state === "CACHED") {
        this._evictEntry(entry);
        this._cache.delete(pageNum);
      }
    }
  }

  /** Release all resources and clear the entire cache. */
  clear(): void {
    for (const entry of this._cache.values()) {
      this._evictEntry(entry);
    }
    this._cache.clear();
    this._totalMemoryBytes = 0;
  }

  // ── Private helpers ─────────────────────────────────────

  private _enforceCapacity(): void {
    while (this._cache.size > this._config.maxPages) {
      this._evictLRU();
    }
  }

  private _enforceMemoryBudget(): void {
    while (this._totalMemoryBytes > this._config.maxMemoryBytes && this._cache.size > 1) {
      this._evictLRU();
    }
  }

  /**
   * Evict the least-recently-used READY/CACHED page.
   * Skip pages that are currently QUEUED/LOADING/RENDERING
   * (evicting those would cause visual corruption).
   */
  private _evictLRU(): void {
    for (const [pageNum, entry] of this._cache) {
      // Map iteration order == insertion order == LRU first
      if (entry.state === "READY" || entry.state === "CACHED") {
        this._evictEntry(entry);
        this._cache.delete(pageNum);
        return;
      }
    }
  }

  private _evictEntry(entry: CacheEntry): void {
    // 1. Cancel any in-flight render
    if (entry.renderTask) {
      try { entry.renderTask.cancel(); } catch (_) {}
      entry.renderTask = null;
    }

    // 2. Release PDF.js page resources
    if (entry.pageProxy) {
      try { entry.pageProxy.cleanup(); } catch (_) {}
      entry.pageProxy = null;
    }

    // 3. Clear canvas backing store
    if (entry.canvas) {
      const ctx = entry.canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, entry.canvas.width, entry.canvas.height);
      // Zero out dimensions to release GPU memory
      entry.canvas.width = 0;
      entry.canvas.height = 0;
      entry.canvas = null;
    }

    // 4. Update memory accounting
    this._totalMemoryBytes = Math.max(0, this._totalMemoryBytes - entry.estimatedMemoryBytes);
    entry.estimatedMemoryBytes = 0;

    // 5. Update state
    entry.viewport = null;
    entry.state = "EVICTED";
  }
}
