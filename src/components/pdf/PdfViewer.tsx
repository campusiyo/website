"use client";

// ============================================================
// PdfViewer — Production-grade PDF viewer (engine v2, layout v4)
// ============================================================
//
// Pipeline: PDF → PDF.js → Canvas → HTML Watermark Overlay → Screen
//
// ── Scale computation (in RenderWorker) ──────────────────────────────────────
//   fitScale       = min(1.0, containerWidth / naturalPageWidth)
//   effectiveScale = fitScale × zoom
//   → At zoom=1.0: page fits container, never wider than screen (no h-scroll)
//   → At zoom>1.0: page grows beyond natural; parent scroll shows h-scrollbar
//
// ── Container width measurement ──────────────────────────────────────────────
//   Uses a ref callback (not useEffect) on the outer div so width is seeded
//   synchronously at mount time, before IntersectionObserver fires the first
//   render. This is the fix for the horizontal overflow bug.
//
// ── Vertical gap ─────────────────────────────────────────────────────────────
//   gap: 6px between sentinel rows (no py-4, no space-y-8).
//   Page number label is inside the card as an absolute overlay — no extra height.
//
// ── Virtualization (unchanged) ───────────────────────────────────────────────
//   All N sentinel divs are in the DOM. Canvases exist only for LRU window.
//   IntersectionObserver drives scheduling and eviction.
// ============================================================

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { DocumentLoader } from "./engine/DocumentLoader";
import { MetadataManager } from "./engine/MetadataManager";
import { CacheManager } from "./engine/CacheManager";
import { RenderWorker } from "./engine/RenderWorker";
import { RenderScheduler } from "./engine/RenderScheduler";
import { ViewportManager } from "./engine/ViewportManager";
import { TelemetryManager } from "./engine/TelemetryManager";
import type { PageState } from "./engine/types";

// ── Props (unchanged) ────────────────────────────────────────────────────────

interface PdfViewerProps {
  pdfUrl: string;
  zoom: number;
  rotation: number;
  currentPage: number;
  onPageChange: (pageNum: number) => void;
  onTotalPagesChange: (total: number) => void;
  viewerRef: React.RefObject<HTMLDivElement | null>;
  user: any;
  noteId: string;
  setZoom: (zoom: number) => void;
  isDarkMode: boolean;
}

// ── Per-page React state (engine state lives in CacheManager) ────────────────

interface PageRenderState {
  state: PageState;
  cssWidth: number;   // logical CSS px (0 until first render)
  cssHeight: number;  // logical CSS px (0 until first render)
}

// ── A4 aspect ratio for placeholder before real dims arrive ──────────────────
const A4_ASPECT = 842 / 595; // ≈ 1.414

// ── PdfViewer component ──────────────────────────────────────────────────────

export default function PdfViewer({
  pdfUrl,
  zoom,
  rotation,
  currentPage,
  onPageChange,
  onTotalPagesChange,
  viewerRef,
  user,
  noteId,
  setZoom,
  isDarkMode,
}: PdfViewerProps) {
  const [pdfjs, setPdfjs]           = useState<any>(null);
  const [numPages, setNumPages]     = useState<number>(0);
  const [docLoading, setDocLoading] = useState<boolean>(true);
  const [docError, setDocError]     = useState<string | null>(null);
  const [pageStates, setPageStates] = useState<Map<number, PageRenderState>>(new Map());

  // CSS transform scale applied during zoom gesture (Phase 1 feedback)
  const [cssZoomScale, setCssZoomScale] = useState<number>(1);
  const prevZoomRef    = useRef<number>(zoom);
  const zoomDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep rotation accessible in ResizeObserver callback without closure issues
  const rotationRef    = useRef<number>(rotation);

  // Device pixel ratio — capped at 2 for memory budget on high-DPI mobile
  const dpr = useMemo(
    () => (typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1),
    []
  );

  // ── Container width ───────────────────────────────────────────────────────
  //
  // Measured from the PdfViewer's outer div using a ref CALLBACK (not useEffect).
  //
  // Why ref callback instead of useEffect?
  //   The main div is only rendered when docLoading=false (the loading spinner
  //   renders instead). A useEffect(deps=[]) would run before the div exists,
  //   leaving containerWidthRef at 0 — causing the first page render to use
  //   the fallback (raw zoom), which overflows on narrow screens.
  //
  //   A ref callback is called by React synchronously during the commit phase
  //   when the element first mounts. This guarantees the width is seeded
  //   BEFORE IntersectionObserver fires the first render request.
  const containerWidthRef   = useRef<number>(0);
  const resizeObserverRef   = useRef<ResizeObserver | null>(null);

  // This callback is passed as the `ref` prop on the outer div.
  // Called with the element when it mounts, and with null when it unmounts.
  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    // Clean up any previous observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (!el) return;

    // ── Synchronously compute and seed the usable width ──────────────────
    // Usable = clientWidth minus horizontal padding (8px each side = 16px).
    // We subtract the padding here so RenderWorker receives the exact pixel
    // budget available for the canvas — no further subtraction needed there.
    const HPAD   = 16; // 8px left + 8px right (matches paddingLeft/Right on outer div)
    const usable = Math.max(el.clientWidth - HPAD, 80);
    containerWidthRef.current = usable;

    // ── Push to scheduler immediately ─────────────────────────────────────
    // Critical: the scheduler may already exist (created in .then() before
    // setDocLoading(false) triggered this div to mount). Without this call
    // the scheduler keeps containerWidth=0 and renders at raw zoom — causing
    // the canvas to be wider than the viewport and getting cropped.
    schedulerRef.current?.updateContext({
      zoom:           prevZoomRef.current,
      rotation:       rotationRef.current,
      containerWidth: usable,
    });

    // ── ResizeObserver for subsequent layout changes ───────────────────────
    if (typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      const newUsable = Math.max(el.clientWidth - HPAD, 80);
      if (newUsable === containerWidthRef.current) return;
      containerWidthRef.current = newUsable;
      schedulerRef.current?.updateContext({
        zoom:           prevZoomRef.current,
        rotation:       rotationRef.current,
        containerWidth: newUsable,
      });
    });

    ro.observe(el);
    resizeObserverRef.current = ro;
  }, []); // stable — no deps needed

  // ── Engine instances (stable refs) ───────────────────────────────────────
  const loaderRef      = useRef<DocumentLoader   | null>(null);
  const metadataRef    = useRef<MetadataManager  | null>(null);
  const cacheRef       = useRef<CacheManager     | null>(null);
  const workerRef      = useRef<RenderWorker     | null>(null);
  const schedulerRef   = useRef<RenderScheduler  | null>(null);
  const viewportMgrRef = useRef<ViewportManager  | null>(null);
  const telemetryRef   = useRef<TelemetryManager | null>(null);

  // DOM refs for sentinel and canvas slot divs (populated by ref callbacks)
  const sentinelRefs   = useRef<Map<number, HTMLDivElement>>(new Map());
  const canvasSlotRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // ── 1. Load PDF.js from CDN ───────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).pdfjsLib) { setPdfjs((window as any).pdfjsLib); return; }

    const existing = document.getElementById("pdfjs-cdn-script");
    if (existing) {
      existing.addEventListener("load", () => {
        if ((window as any).pdfjsLib) setPdfjs((window as any).pdfjsLib);
      });
      return;
    }

    const script = document.createElement("script");
    script.id    = "pdfjs-cdn-script";
    script.src   = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setPdfjs(lib);
    };
    script.onerror = () => {
      setDocError("Failed to load PDF engine. Please refresh the page.");
      setDocLoading(false);
    };
    document.body.appendChild(script);
  }, []);

  // ── 2. Initialize engine subsystems once ─────────────────────────────────

  useEffect(() => {
    telemetryRef.current ??= new TelemetryManager();
    loaderRef.current    ??= new DocumentLoader();
    metadataRef.current  ??= new MetadataManager();
    cacheRef.current     ??= new CacheManager();

    return () => {
      schedulerRef.current?.destroy();
      viewportMgrRef.current?.destroy();
      cacheRef.current?.clear();
      loaderRef.current?.destroy();
      telemetryRef.current?.destroy();
      resizeObserverRef.current?.disconnect();
      schedulerRef.current   = null;
      viewportMgrRef.current = null;
    };
  }, []);

  // ── 3. Load document ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!pdfjs || !pdfUrl) return;

    const metadata  = metadataRef.current!;
    const cache     = cacheRef.current!;
    const telemetry = telemetryRef.current!;
    const loader    = loaderRef.current!;

    setDocLoading(true);
    setDocError(null);
    setNumPages(0);
    setPageStates(new Map());
    setCssZoomScale(1);
    prevZoomRef.current = zoom;

    // Always start from page 1 — reset the scroll position immediately
    if (viewerRef.current) viewerRef.current.scrollTop = 0;

    schedulerRef.current?.destroy();
    viewportMgrRef.current?.destroy();
    cache.clear();
    metadata.reset();

    const token = typeof window !== "undefined"
      ? localStorage.getItem("campusiyo_access_token")
      : null;

    loader.load(pdfjs, { url: pdfUrl, token }).then(({ doc, numPages: n }) => {

      metadata.initialize(doc, n);
      setNumPages(n);
      onTotalPagesChange(n);

      const initialStates = new Map<number, PageRenderState>();
      for (let i = 1; i <= n; i++) {
        initialStates.set(i, { state: "NOT_LOADED", cssWidth: 0, cssHeight: 0 });
      }
      setPageStates(initialStates);

      // ── onRenderComplete ────────────────────────────────────────────────
      const onRenderComplete = (pageNum: number, success: boolean) => {
        if (success) {
          const entry = cache.peek(pageNum);
          if (entry?.canvas) {
            const slot = canvasSlotRefs.current.get(pageNum);
            if (slot) {
              while (slot.firstChild) slot.removeChild(slot.firstChild);
              slot.appendChild(entry.canvas);
            }
          }
        }

        setPageStates(prev => {
          const next  = new Map(prev);
          const entry = cache.peek(pageNum);
          next.set(pageNum, {
            state:     success ? "READY" : "ERROR",
            cssWidth:  success && entry ? entry.cssWidth  : (prev.get(pageNum)?.cssWidth  ?? 0),
            cssHeight: success && entry ? entry.cssHeight : (prev.get(pageNum)?.cssHeight ?? 0),
          });
          return next;
        });
      };

      // ── Build engine ────────────────────────────────────────────────────
      const worker = new RenderWorker({
        doc, cache, metadata, telemetry, devicePixelRatio: dpr,
      });
      workerRef.current = worker;

      telemetry.connect(
        () => cache.hits,
        () => cache.misses,
        () => cache.totalMemoryBytes
      );

      const scheduler = new RenderScheduler(cache, worker, telemetry, onRenderComplete);

      // ── Seed containerWidth ────────────────────────────────────────────
      // setContainerRef runs during the re-render commit AFTER setDocLoading(false).
      // At this point in .then(), the main div has NOT yet mounted, so
      // containerWidthRef.current may still be 0.
      // Use viewerRef.current.clientWidth as a reliable fallback: viewerRef is
      // always mounted (it lives in ReaderLayout, not behind a docLoading guard).
      if (containerWidthRef.current === 0 && viewerRef.current) {
        const HPAD   = 16;
        containerWidthRef.current = Math.max(viewerRef.current.clientWidth - HPAD, 80);
      }

      scheduler.updateContext({
        zoom,
        rotation,
        containerWidth: containerWidthRef.current,
      });
      schedulerRef.current = scheduler;

      const viewportMgr = new ViewportManager(
        scheduler,
        (visiblePages) => {
          if (visiblePages.size > 0) {
            const min = Math.min(...Array.from(visiblePages));
            onPageChange(min);
            localStorage.setItem(`campusiyo_note_page_${noteId}`, String(min));
          }
        }
      );
      viewportMgrRef.current = viewportMgr;

      if (viewerRef.current) viewportMgr.initialize(viewerRef.current);
      for (const [pn, el] of sentinelRefs.current) viewportMgr.observe(pn, el);

      setDocLoading(false);

      // Always open from page 1 — never restore a previously viewed page.
      // The scroll container starts at top=0 by default; no action needed.

    }).catch((err: any) => {
      console.error("[PdfViewer] load failed:", err);
      let msg = "Failed to load the document.";
      if (err?.name === "MissingPDFException")  msg = "Document not found on the server.";
      if (err?.name === "InvalidPDFException")  msg = "Not a valid PDF file.";
      if (String(err).includes("401"))          msg = "Authentication failed. Please log in again.";
      if (String(err).includes("403"))          msg = "Access denied.";
      setDocError(msg);
      setDocLoading(false);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfjs, pdfUrl, noteId]);

  // ── 4. Sync zoom/rotation to scheduler ───────────────────────────────────

  useEffect(() => {
    rotationRef.current = rotation;
    schedulerRef.current?.updateContext({
      zoom, rotation, containerWidth: containerWidthRef.current,
    });
  }, [zoom, rotation]);

  // ── 5. Zoom lifecycle ─────────────────────────────────────────────────────
  //
  // Phase 1 (<250ms): CSS scale transform for instant feedback.
  // Phase 2 (250ms idle): evict all cached pages, re-schedule visible ones.
  // Pages are re-rendered at the new effectiveScale by RenderWorker.

  useEffect(() => {
    const prev = prevZoomRef.current;
    prevZoomRef.current = zoom;
    if (prev === zoom) return;

    // Phase 1: visual feedback via CSS transform (relative scale = new/old)
    setCssZoomScale(zoom / prev);

    if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current);
    zoomDebounceRef.current = setTimeout(() => {
      setCssZoomScale(1);

      const scheduler = schedulerRef.current;
      const cache     = cacheRef.current;
      if (!scheduler || !cache) return;

      // Evict all rendered pages — their scale is now stale
      for (const pn of cache.pageNums) {
        const entry = cache.peek(pn);
        if (entry && (entry.state === "READY" || entry.state === "CACHED")) {
          cache.evict(pn);
          const slot = canvasSlotRefs.current.get(pn);
          if (slot) while (slot.firstChild) slot.removeChild(slot.firstChild);
        }
      }

      // Reset React state for all evicted pages, preserving last known dims
      setPageStates(prev => {
        const next = new Map(prev);
        for (const [pn, ps] of prev) {
          if (ps.state === "READY" || ps.state === "CACHED") {
            next.set(pn, { state: "NOT_LOADED", cssWidth: ps.cssWidth, cssHeight: ps.cssHeight });
          }
        }
        return next;
      });

      // Re-schedule visible pages; IntersectionObserver handles the rest
      const visible = viewportMgrRef.current?.visiblePages ?? new Set<number>();
      for (const pn of visible) scheduler.schedule(pn);

    }, 250);

    return () => { if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  // ── 6. Keyboard navigation ────────────────────────────────────────────────

  useEffect(() => {
    if (numPages === 0) return;
    const scrollTo = (target: number) => {
      const el = sentinelRefs.current.get(target);
      if (el && viewerRef.current) {
        viewerRef.current.scrollTo({ top: (el as HTMLElement).offsetTop - 80, behavior: "smooth" });
        viewportMgrRef.current?.setScrollDirection(target > currentPage ? "down" : "up");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.ctrlKey && (e.key === "=" || e.key === "+"))       { e.preventDefault(); setZoom(Math.min(3.0, zoom + 0.1)); }
      else if (e.ctrlKey && e.key === "-")                     { e.preventDefault(); setZoom(Math.max(0.25, zoom - 0.1)); }
      else if (e.key === "ArrowRight" && currentPage < numPages) { e.preventDefault(); scrollTo(currentPage + 1); }
      else if (e.key === "ArrowLeft"  && currentPage > 1)       { e.preventDefault(); scrollTo(currentPage - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPage, numPages, zoom, setZoom, viewerRef]);

  // ── Stable ref callbacks ──────────────────────────────────────────────────

  const setSentinelRef = useCallback(
    (pageNum: number) => (el: HTMLDivElement | null) => {
      if (el) {
        sentinelRefs.current.set(pageNum, el);
        viewportMgrRef.current?.observe(pageNum, el);
      } else {
        viewportMgrRef.current?.unobserve(pageNum);
        sentinelRefs.current.delete(pageNum);
      }
    }, []
  );

  const setCanvasSlotRef = useCallback(
    (pageNum: number) => (el: HTMLDivElement | null) => {
      if (el) {
        canvasSlotRefs.current.set(pageNum, el);
        // Attach canvas if already rendered before this div mounted
        const entry = cacheRef.current?.peek(pageNum);
        if (entry?.canvas && !el.contains(entry.canvas)) {
          while (el.firstChild) el.removeChild(el.firstChild);
          el.appendChild(entry.canvas);
        }
      } else {
        canvasSlotRefs.current.delete(pageNum);
      }
    }, []
  );

  // ── Loading / error UI ────────────────────────────────────────────────────

  if (docLoading) {
    return (
      // Full-viewport centering so the indicator is centered in the space
      // below the fixed navbar (pt-16 = 64px toolbar height).
      // Using min-h-screen with flex so it fills the entire visible area.
      <div
        className="w-full flex flex-col items-center justify-center select-none"
        style={{ minHeight: "calc(100vh - 64px)", paddingTop: "0" }}
      >
        {/* Campusiyo logo mark */}
        <div
          style={{
            width:  56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #00A16C 0%, #007A52 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,161,108,0.25)",
            marginBottom: 20,
          }}
        >
          {/* Stylised "C" lettermark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <text
              x="50%" y="72%"
              dominantBaseline="auto"
              textAnchor="middle"
              fontSize="22"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              fill="white"
            >C</text>
          </svg>
        </div>

        {/* Loading... */}
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#374151",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Loading...
        </p>

        {/* Please wait */}
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "#9CA3AF",
            marginTop: 6,
            letterSpacing: "0.04em",
          }}
        >
          Please wait
        </p>

        {/* Animated dots indicator */}
        <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00A16C",
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(0.8); opacity: 0.4; }
            50% { transform: scale(1.15); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (docError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center px-8">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="text-sm font-semibold text-gray-400">{docError}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00A16C]/10 text-[#00A16C] border border-[#00A16C]/20 hover:bg-[#00A16C]/20 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  //
  // Outer div: gets `ref={setContainerRef}` — width seeded synchronously on mount.
  // Inner list: gap:6px between sentinel rows (total visual gap between pages = 6px).
  // No py-4, no space-y-8, no extra padding.

  return (
    <div
      ref={setContainerRef}
      className={`w-full flex flex-col items-center select-none${isDarkMode ? " pdf-dark-mode" : ""}`}
      style={{
        // paddingLeft/Right: 8px each side = 16px total horizontal padding.
        // The usable canvas width = clientWidth - 16, computed in setContainerRef
        // and passed to RenderWorker so the canvas is always ≤ available space.
        paddingTop:    "16px",
        paddingBottom: "32px",
        paddingLeft:   "8px",
        paddingRight:  "8px",
        // Do NOT set overflow:hidden here — the canvas must never be clipped.
        // Horizontal scroll at zoom>1 is handled by the parent scroll container.
        boxSizing: "border-box",
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {isDarkMode && (
        <style dangerouslySetInnerHTML={{
          __html: `.pdf-dark-mode .pdf-canvas-slot canvas { filter: invert(0.93) hue-rotate(180deg) !important; }`
        }} />
      )}

      {/*
        Page list.
        gap: 6px = total gap between page card bottom edge and next page card top edge.
        Sentinels have NO padding. Page label is INSIDE the card (no extra height).
      */}
      <div
        className="w-full flex flex-col items-center"
        style={{ gap: "6px" }}
      >
        {Array.from({ length: numPages }, (_, i) => {
          const pageNum = i + 1;
          const ps = pageStates.get(pageNum);
          return (
            <PageSlot
              key={pageNum}
              pageNum={pageNum}
              numPages={numPages}
              state={ps?.state ?? "NOT_LOADED"}
              cssWidth={ps?.cssWidth ?? 0}
              cssHeight={ps?.cssHeight ?? 0}
              containerWidth={containerWidthRef.current}
              zoom={zoom}
              cssZoomScale={cssZoomScale}
              user={user}
              setSentinelRef={setSentinelRef}
              setCanvasSlotRef={setCanvasSlotRef}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── PageSlot ─────────────────────────────────────────────────────────────────
//
// Sentinel div: no padding, no margin, width=100%.
//   → Total height = card height only.
//   → Gap between consecutive sentinel divs = 6px (from parent's gap property).
//   → Total gap between canvas N and canvas N+1 = exactly 6px.
//
// Page card: position:relative, no overflow:hidden, no maxWidth, no aspectRatio.
//   → Canvas dictates width/height via style.width/height.
//   → Watermark and label are position:absolute (no extra height).
//
// Page number label: position:absolute at bottom of card, semi-transparent overlay.
//   → Zero extra height between pages (label is inside the card footprint).
//
// Placeholder: sized from containerWidth and A4 aspect ratio estimate.
//   → Uses last known cssWidth/cssHeight after first render (exact match).

interface PageSlotProps {
  pageNum: number;
  numPages: number;
  state: PageState;
  cssWidth: number;
  cssHeight: number;
  containerWidth: number;
  zoom: number;
  cssZoomScale: number;
  user: any;
  setSentinelRef:   (n: number) => (el: HTMLDivElement | null) => void;
  setCanvasSlotRef: (n: number) => (el: HTMLDivElement | null) => void;
}

const PageSlot = React.memo(function PageSlot({
  pageNum,
  numPages,
  state,
  cssWidth,
  cssHeight,
  containerWidth,
  zoom,
  cssZoomScale,
  user,
  setSentinelRef,
  setCanvasSlotRef,
}: PageSlotProps) {
  const isReady   = state === "READY"   || state === "CACHED";
  const isError   = state === "ERROR";
  const isLoading = state === "QUEUED"  || state === "LOADING" || state === "RENDERING";

  // ── Placeholder sizing ──────────────────────────────────────────────────
  //
  // Goal: stable height from first paint so the scroll container doesn't jump.
  //
  // If real dims known (after first render): use them exactly.
  // Otherwise estimate using the same formula RenderWorker will use:
  //   fitScale      = min(1.0, containerWidth / 595)
  //   effectiveScale = fitScale × zoom
  //   width          = 595 × effectiveScale
  //   height         = 842 × effectiveScale   (A4 ratio)
  const placeholderW = cssWidth > 0
    ? cssWidth
    : (() => {
        const eff = (containerWidth > 0)
          ? Math.min(1.0, containerWidth / 595) * zoom
          : zoom;
        return Math.round(595 * eff);
      })();

  const placeholderH = cssHeight > 0
    ? cssHeight
    : Math.round(placeholderW * A4_ASPECT);

  // Watermark text (recomputed only when user prop changes)
  const watermarkText = useMemo(() => {
    if (!user) return null;
    return [user.fullName || "Student", user.email, "campusiyo.in"]
      .filter(Boolean).join(" · ");
  }, [user]);

  return (
    // Sentinel div: the IntersectionObserver target.
    // NO padding, NO margin — height equals the page card exactly.
    // The 6px gap comes entirely from the parent's `gap` property.
    <div
      ref={setSentinelRef(pageNum)}
      data-page={pageNum}
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        width:          "100%",
        // No padding — gap is controlled by parent
      }}
    >
      {/*
        Page card.
          • position: relative   → watermark + label overlay anchors here
          • No overflow: hidden  → canvas never clipped
          • No maxWidth          → canvas dictates width
          • No aspectRatio       → canvas dictates height
          • fit-content when ready: card shrinks to canvas exactly
      */}
      <div
        className="relative shadow-lg rounded-sm"
        style={{
          // When ready: fit-content so card = canvas exactly (no extra space)
          width:  isReady ? "fit-content" : `${placeholderW}px`,
          height: isReady ? "fit-content" : `${placeholderH}px`,
          background: "#ffffff",
          border:     "1px solid rgba(0,0,0,0.12)",
          // CSS zoom transform during gesture (Phase 1)
          transform:       cssZoomScale !== 1 ? `scale(${cssZoomScale})` : undefined,
          transformOrigin: "center top",
          willChange:      cssZoomScale !== 1 ? "transform" : "auto",
        }}
      >
        {/*
          Canvas slot.
          display:block + lineHeight:0 removes the implicit inline gap below canvas.
          Opacity fades in on render completion.
        */}
        <div
          ref={setCanvasSlotRef(pageNum)}
          className="pdf-canvas-slot"
          style={{
            display:    "block",
            lineHeight: 0,
            opacity:    isReady ? 1 : 0,
            transition: "opacity 0.15s ease",
          }}
        />

        {/* Watermark: absolute overlay, never drawn into canvas */}
        {isReady && watermarkText && (
          <WatermarkOverlay text={watermarkText} />
        )}

        {/*
          Page number label.
          position:absolute at the card's bottom edge.
          This keeps it INSIDE the card footprint — adds zero height between pages.
          The label floats over the bottom ~16px of the PDF content.
        */}
        <div
          aria-label={`Page ${pageNum} of ${numPages}`}
          style={{
            position:       "absolute",
            bottom:         0,
            left:           0,
            right:          0,
            height:         "16px",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            // Gradient fade from transparent to barely-visible — does not
            // obscure page content, just a subtle indicator at the bottom edge
            background:     "linear-gradient(to bottom, transparent, rgba(0,0,0,0.08))",
            zIndex:         11,
            pointerEvents:  "none",
            userSelect:     "none",
          }}
        >
          <span style={{
            fontSize:      "8px",
            fontWeight:    600,
            fontFamily:    "system-ui, sans-serif",
            letterSpacing: "0.12em",
            color:         "rgba(0,0,0,0.35)",
            textTransform: "uppercase",
          }}>
            {pageNum} / {numPages}
          </span>
        </div>

        {/* Loading skeleton: covers placeholder while page is being rendered */}
        {(state === "NOT_LOADED" || isLoading) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(244,245,247,0.97)", zIndex: 5 }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#00A16C]/50" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 500 }}>
                  Rendering page {pageNum}…
                </span>
              </>
            ) : (
              <span style={{ fontSize: "10px", color: "#d1d5db", fontWeight: 500 }}>
                Page {pageNum}
              </span>
            )}
          </div>
        )}

        {/* Error placeholder */}
        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-50" style={{ zIndex: 5 }}>
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#f87171" }}>
              Page {pageNum} failed to render
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

// ── WatermarkOverlay ─────────────────────────────────────────────────────────
//
// Transparent HTML div: position:absolute, inset:0, pointer-events:none, z-index:10.
// Never touches the canvas pixel buffer — re-renders ONLY when text prop changes.
// Design: 10 rows of 4× repeated text at -28°, 18% opacity, 13px fixed.

const WatermarkOverlay = React.memo(function WatermarkOverlay({ text }: { text: string }) {
  const ROWS = 10;
  return (
    <div
      aria-hidden="true"
      style={{
        position:      "absolute",
        inset:         0,
        pointerEvents: "none",
        overflow:      "hidden",
        zIndex:        10,
        userSelect:    "none",
      }}
    >
      {Array.from({ length: ROWS }, (_, row) => (
        <div
          key={row}
          style={{
            position:        "absolute",
            top:             `${(row / (ROWS - 1)) * 120 - 10}%`,
            left:            "-20%",
            right:           "-20%",
            whiteSpace:      "nowrap",
            transform:       "rotate(-28deg)",
            transformOrigin: "center center",
            fontSize:        "13px",
            fontWeight:      700,
            fontFamily:      "system-ui, -apple-system, sans-serif",
            color:           "rgba(80, 80, 80, 0.18)",
            letterSpacing:   "0.08em",
            display:         "flex",
            gap:             "4em",
            justifyContent:  "space-around",
          }}
        >
          {Array.from({ length: 4 }, (_, c) => <span key={c}>{text}</span>)}
        </div>
      ))}
    </div>
  );
});
