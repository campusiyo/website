"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, 
  BookOpen, FileText, Sparkles, Sidebar, Settings, ShieldAlert, 
  RotateCcw, Compass, Moon, Sun, ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

interface CustomPdfReaderProps {
  pdfUrl: string;
  noteId: string;
  isBlurred?: boolean;
}

export default function CustomPdfReader({ pdfUrl, noteId, isBlurred = false }: CustomPdfReaderProps) {
  const { user } = useAuth();
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.25);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [resumePrompt, setResumePrompt] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // 1. Dynamically Load PDF.js from CDN
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if script is already injected
    const existingScript = document.getElementById("pdfjs-cdn-script");
    if (existingScript && (window as any).pdfjsLib) {
      setPdfjs((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement("script");
    script.id = "pdfjs-cdn-script";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setPdfjs(lib);
    };
    document.body.appendChild(script);

    return () => {
      // Keep script cached globally to avoid reloading on remounts
    };
  }, []);

  // 2. Load PDF Document once pdfjs is ready
  useEffect(() => {
    if (!pdfjs || !pdfUrl) return;

    const loadDocument = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("campusiyo_access_token") : null;
        
        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
          httpHeaders: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          withCredentials: true,
        });
        
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);

        // Check if there is a saved reading progress page in localStorage
        const savedPage = localStorage.getItem(`campusiyo_note_page_${noteId}`);
        if (savedPage) {
          const pageNum = parseInt(savedPage, 10);
          if (pageNum > 1 && pageNum <= doc.numPages) {
            setResumePrompt(pageNum);
          }
        }
      } catch (err) {
        console.error("Error loading PDF document:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [pdfjs, pdfUrl, noteId]);

  // 3. Scroll spy listener to detect active page
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || numPages === 0) return;

    const handleScroll = () => {
      const scrollPosition = viewer.scrollTop + 100;
      let active = 1;

      for (let i = 1; i <= numPages; i++) {
        const pageEl = pageRefs.current[i];
        if (pageEl) {
          const offsetTop = pageEl.offsetTop;
          const offsetHeight = pageEl.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            active = i;
            break;
          }
        }
      }

      setCurrentPage(active);
      localStorage.setItem(`campusiyo_note_page_${noteId}`, active.toString());
    };

    viewer.addEventListener("scroll", handleScroll);
    return () => viewer.removeEventListener("scroll", handleScroll);
  }, [numPages, noteId]);

  // 4. Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement?.tagName.toLowerCase();
      if (activeEl === "input" || activeEl === "textarea") return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollPage(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollPage(-1);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "d" || e.key === "D") {
        setIsDarkMode(prev => !prev);
      } else if (e.key === "=" || e.key === "+") {
        adjustZoom(0.1);
      } else if (e.key === "-") {
        adjustZoom(-0.1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, numPages]);

  // 5. Fullscreen event change listener to sync state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const scrollPage = (direction: number) => {
    const target = currentPage + direction;
    if (target >= 1 && target <= numPages) {
      jumpToPage(target);
    }
  };

  const jumpToPage = (pageNum: number) => {
    const pageEl = pageRefs.current[pageNum];
    if (pageEl && viewerRef.current) {
      viewerRef.current.scrollTo({
        top: pageEl.offsetTop,
        behavior: "smooth"
      });
      setCurrentPage(pageNum);
    }
  };

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2.0));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error toggling fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Render subpage canvases dynamically
  const renderCanvasPages = () => {
    return Array.from({ length: numPages }, (_, i) => {
      const pageNum = i + 1;
      return (
        <div 
          key={pageNum}
          ref={(el) => { pageRefs.current[pageNum] = el; }}
          className="py-4 flex flex-col items-center justify-center bg-gray-100/50 dark:bg-slate-900 border-b border-border-light/40 last:border-0 w-full"
        >
          <div className="text-xs font-semibold text-secondary-gray select-none mb-2">
            Page {pageNum} of {numPages}
          </div>
          <LazyCanvasPage 
            pdfDoc={pdfDoc}
            pageNumber={pageNum}
            zoom={zoom}
            user={user}
          />
        </div>
      );
    });
  };

  // Est reading time (2 minutes per page)
  const estReadingTime = Math.max(1, numPages * 2);

  // Outline element click jump
  const handleOutlineItemClick = async (dest: any) => {
    if (!pdfDoc || !dest) return;
    try {
      let destRef = dest;
      if (typeof dest === "string") {
        destRef = await pdfDoc.getDestination(dest);
      }
      if (destRef && destRef[0]) {
        const pageIdx = await pdfDoc.getPageIndex(destRef[0]);
        jumpToPage(pageIdx + 1);
      }
    } catch (e) {
      console.warn("Could not navigate to Outline Destination:", e);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col w-full h-full bg-card-bg text-foreground transition-all duration-300 relative ${
        isFullscreen ? "h-screen z-50" : ""
      }`}
    >
      {/* 1. TOP STICKY TOOLBAR */}
      <div className="sticky top-0 bg-navbar-bg/95 border-b border-border-light/80 p-3 z-30 flex flex-wrap gap-4 items-center justify-between shadow-sm backdrop-blur-md">
        
        {/* Toggle sidebars */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowThumbnails(prev => !prev)}
            className={`p-1.5 h-8 w-8 cursor-pointer ${showThumbnails ? "bg-primary/5 text-primary border-primary/20" : ""}`}
            title="Toggle Thumbnails Panel (Left)"
          >
            <Sidebar className="h-4 w-4" />
          </Button>
          <div className="text-xs text-secondary-gray font-medium hidden sm:block">
            {estReadingTime} min read estimate
          </div>
        </div>

        {/* Dynamic scroll progress */}
        <div className="absolute top-0 left-0 right-0 h-0.75 bg-primary/10">
          <div 
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${(currentPage / Math.max(1, numPages)) * 100}%` }}
          />
        </div>

        {/* Page controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scrollPage(-1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5 text-xs font-semibold select-none">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= numPages) jumpToPage(val);
              }}
              className="w-9 text-center bg-background border border-border-light rounded px-1 py-0.5 focus:border-primary outline-none"
            />
            <span className="text-secondary-gray">/</span>
            <span>{numPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => scrollPage(1)}
            disabled={currentPage === numPages}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom & Theme & View Modes */}
        <div className="flex items-center gap-2">
          
          {/* Zoom controls */}
          <div className="flex items-center gap-1 border border-border-light rounded-lg p-0.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustZoom(-0.1)}
              disabled={zoom <= 0.5}
              className="h-7 w-7 p-0 cursor-pointer text-secondary-gray border-0 hover:bg-foreground/[0.03]"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <div className="text-[10px] font-bold w-10 text-center select-none text-secondary-gray">
              {Math.round(zoom * 100)}%
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustZoom(0.1)}
              disabled={zoom >= 2.0}
              className="h-7 w-7 p-0 cursor-pointer text-secondary-gray border-0 hover:bg-foreground/[0.03]"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Dark Mode toggle specifically for PDF render */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(prev => !prev)}
            className={`h-8 w-8 p-0 cursor-pointer ${isDarkMode ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : ""}`}
            title="Invert PDF Theme colors"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Fullscreen toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* 2. BODY SPLIT LAYOUT */}
      <div className="flex-grow flex items-stretch overflow-hidden relative">

        {/* Screenshot Suspended Overlay */}
        {isBlurred && (
          <div className="absolute inset-0 bg-gray-950/98 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-50 transition-all duration-300">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 mb-4 animate-pulse">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Screenshot Protection Engaged</h3>
            <p className="text-sm text-gray-400 mt-2.5 max-w-sm leading-relaxed">
              Viewing is suspended because the browser window has lost focus. Click back inside the page area to resume reading.
            </p>
          </div>
        )}

        {/* A. LEFT SIDEBAR: Page thumbnails */}
        {showThumbnails && (
          <div className="w-44 border-r border-border-light/80 bg-gray-50/50 dark:bg-slate-900/50 flex flex-col select-none">
            <div className="p-3 border-b border-border-light/50 text-[10px] font-bold text-secondary-gray uppercase tracking-wider">
              Page Thumbnails
            </div>
            <div className="flex-grow overflow-y-auto p-3 space-y-3.5 scrollbar-thin">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                Array.from({ length: numPages }, (_, i) => {
                  const pNum = i + 1;
                  const isActive = currentPage === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => jumpToPage(pNum)}
                      className={`w-full text-left focus:outline-none flex flex-col gap-1 cursor-pointer transition-all duration-150 ${
                        isActive ? "scale-102" : "hover:opacity-85"
                      }`}
                    >
                      <div className={`relative w-full h-32 rounded-lg bg-white overflow-hidden border shadow-sm transition-all ${
                        isActive 
                          ? "border-primary ring-2 ring-primary/20 shadow-primary/10" 
                          : "border-border-light/60"
                      }`}>
                        <LazyCanvasThumbnail 
                          pdfDoc={pdfDoc}
                          pageNumber={pNum}
                          user={user}
                        />
                      </div>
                      <div className={`text-[10px] font-bold text-center mt-1 transition-colors ${
                        isActive ? "text-primary font-extrabold" : "text-secondary-gray"
                      }`}>
                        Page {pNum}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* B. CENTER VIEWPORT: Pages Container */}
        <div 
          ref={viewerRef}
          className={`flex-grow overflow-y-auto bg-gray-200/40 dark:bg-slate-950/40 p-4 scrollbar-thin relative scroll-smooth flex flex-col items-center ${
            isDarkMode ? "pdf-filter-inverted" : ""
          }`}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Style rule to invert PDF elements in reader dark mode */}
          <style dangerouslySetInnerHTML={{ __html: `
            .pdf-filter-inverted canvas {
              filter: invert(0.93) hue-rotate(180deg) !important;
            }
          `}} />

          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center py-20 text-secondary-gray">
              <BookOpen className="h-10 w-10 text-primary animate-bounce mb-3" />
              <span className="text-sm font-semibold animate-pulse">Initializing rendering engine...</span>
            </div>
          ) : (
            <div className="space-y-6 w-full flex flex-col items-center">
              {renderCanvasPages()}
            </div>
          )}
        </div>
      </div>

      {/* 3. RESUME PERSISTENCE NOTIFICATION POPUP */}
      {resumePrompt !== null && (
        <div className="absolute bottom-6 right-6 z-40 bg-card-bg border border-border-light shadow-2xl rounded-2xl p-4 max-w-sm flex items-start gap-3.5 animate-in slide-in-from-bottom duration-300">
          <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-foreground">Resume Reading?</h4>
            <p className="text-xs text-secondary-gray leading-normal">
              You left off on page {resumePrompt} last time. Jump back to that page to continue?
            </p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="py-1 px-3 text-xs"
                onClick={() => {
                  jumpToPage(resumePrompt);
                  setResumePrompt(null);
                }}
              >
                Resume Page {resumePrompt}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="py-1 px-3 text-xs text-secondary-gray"
                onClick={() => setResumePrompt(null)}
              >
                Start Over
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: Lazy loads CanvasPage using IntersectionObserver
interface LazyCanvasPageProps {
  pdfDoc: any;
  pageNumber: number;
  zoom: number;
  user: any;
}

function LazyCanvasPage({ pdfDoc, pageNumber, zoom, user }: LazyCanvasPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        rootMargin: "800px 0px", // Preload pages within 800px vertical buffer
        threshold: 0.01,
      }
    );

    observer.observe(container);
    return () => {
      observer.unobserve(container);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative shadow-md dark:shadow-slate-950 bg-white border border-border-light/20 flex items-center justify-center"
      style={{
        width: "100%",
        maxWidth: `${600 * zoom}px`,
        aspectRatio: "1 / 1.414", // A4 Aspect Ratio
      }}
    >
      {isVisible ? (
        <CanvasPage
          pdfDoc={pdfDoc}
          pageNumber={pageNumber}
          zoom={zoom}
          user={user}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-xs text-secondary-gray/50 animate-pulse py-8">
          <svg className="animate-spin h-5 w-5 text-secondary-gray/30 mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading Page {pageNumber}...
        </div>
      )}
    </div>
  );
}

// Sub-component: Lazy loads CanvasThumbnail using IntersectionObserver
interface LazyCanvasThumbnailProps {
  pdfDoc: any;
  pageNumber: number;
  user: any;
}

function LazyCanvasThumbnail({ pdfDoc, pageNumber, user }: LazyCanvasThumbnailProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        rootMargin: "300px 0px", // Preload thumbnails within 300px vertical buffer
        threshold: 0.01,
      }
    );

    observer.observe(container);
    return () => {
      observer.unobserve(container);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-transparent flex items-center justify-center text-secondary-gray/50 hover:bg-slate-100/10 w-full h-full"
    >
      {isVisible ? (
        <CanvasThumbnail
          pdfDoc={pdfDoc}
          pageNumber={pageNumber}
          user={user}
        />
      ) : (
        <div className="text-[10px] text-secondary-gray/40 select-none animate-pulse">
          {pageNumber}
        </div>
      )}
    </div>
  );
}

// Sub-component: Renders individual PDF Page Canvas with user watermark
interface CanvasPageProps {
  pdfDoc: any;
  pageNumber: number;
  zoom: number;
  user: any;
}

function CanvasPage({ pdfDoc, pageNumber, zoom, user }: CanvasPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!pdfDoc) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        
        // Cancel existing render if any
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const viewport = page.getViewport({ scale: zoom });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        // Draw watermark overlay directly into the canvas pixels
        if (user) {
          const watermarkText1 = `${user.fullName || "Student"} (${user.email || "student@gmail.com"})`;
          const watermarkText2 = `UID: ${user.id || "N/A"} | campusiyo.in`;

          context.save();
          
          // Diagonal rotation
          context.rotate(-30 * Math.PI / 180);
          
          // Responsive font size relative to viewport width
          const fontSize = Math.max(10, Math.round(viewport.width / 36));
          context.font = `bold ${fontSize}px sans-serif`;
          context.fillStyle = "rgba(128, 128, 128, 0.14)"; // subtle semi-transparent gray
          context.textAlign = "center";
          context.textBaseline = "middle";

          // Calculate repeating grid
          const stepX = Math.round(viewport.width / 1.8);
          const stepY = Math.round(viewport.height / 5);
          const startX = -viewport.width;
          const endX = viewport.width * 2;
          const startY = -viewport.height;
          const endY = viewport.height * 2;

          for (let x = startX; x < endX; x += stepX) {
            for (let y = startY; y < endY; y += stepY) {
              context.fillText(watermarkText1, x, y);
              context.fillText(watermarkText2, x, y + fontSize + 6);
            }
          }
          context.restore();
        }
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error("Canvas render error:", err);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber, zoom, user]);

  return <canvas ref={canvasRef} className="max-w-full h-auto" />;
}

// Sub-component: Renders individual Thumbnail Page Canvas with watermark
interface CanvasThumbnailProps {
  pdfDoc: any;
  pageNumber: number;
  user: any;
}

function CanvasThumbnail({ pdfDoc, pageNumber, user }: CanvasThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!pdfDoc) return;

    const renderThumbnail = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        // Thumbnail scale (typically ~0.15)
        const viewport = page.getViewport({ scale: 0.15 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        // Draw smaller watermark on thumbnail
        if (user) {
          const watermarkText1 = `${user.fullName?.split(" ")[0] || "Student"}`;
          const watermarkText2 = `campusiyo.in`;

          context.save();
          context.rotate(-30 * Math.PI / 180);
          context.font = "bold 7px sans-serif";
          context.fillStyle = "rgba(128, 128, 128, 0.16)";
          context.textAlign = "center";
          context.textBaseline = "middle";

          const stepX = 70;
          const stepY = 50;
          const startX = -100;
          const endX = 200;
          const startY = -100;
          const endY = 200;

          for (let x = startX; x < endX; x += stepX) {
            for (let y = startY; y < endY; y += stepY) {
              context.fillText(watermarkText1, x, y);
              context.fillText(watermarkText2, x, y + 9);
            }
          }
          context.restore();
        }
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error("Thumbnail render error:", err);
        }
      }
    };

    renderThumbnail();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber, user]);

  return <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />;
}
