"use client";

import React, { useState, useEffect, useRef } from "react";
import ReadingProgress from "./ReadingProgress";
import ReaderToolbar from "./ReaderToolbar";
import PdfViewer from "./PdfViewer";
import { ShieldAlert, EyeOff } from "lucide-react";

interface ReaderLayoutProps {
  noteId: string;
  pdfUrl: string;
  documentTitle: string;
  subjectBadge?: string;
  isBlurred?: boolean;
  user: any;
  onBack: () => void;
}

export default function ReaderLayout({
  noteId,
  pdfUrl,
  documentTitle,
  subjectBadge,
  isBlurred = false,
  user,
  onBack
}: ReaderLayoutProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const layoutRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef<number>(0);

  // 1. Fullscreen sync listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // 2. Mouse position tracking to show toolbar at top of page
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 75) {
        setIsToolbarVisible(true);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 3. Scroll tracking to hide toolbar when scrolling down
  const handleScroll = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const scrollTop = viewer.scrollTop;
    
    // Determine scroll direction
    if (scrollTop > lastScrollTop.current && scrollTop > 120) {
      // Scroll Down -> hide toolbar
      setIsToolbarVisible(false);
    } else if (scrollTop < lastScrollTop.current) {
      // Scroll Up -> show toolbar
      setIsToolbarVisible(true);
    }
    
    lastScrollTop.current = scrollTop;
  };

  const handleFitWidth = () => {
    if (viewerRef.current) {
      const containerWidth = viewerRef.current.clientWidth;
      // Standard PDF page viewport is approx 612px wide at scale 1.0
      const calculatedScale = (containerWidth - 56) / 612;
      setZoom(Math.min(1.8, Math.max(0.5, Math.round(calculatedScale * 100) / 100)));
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleToggleFullscreen = () => {
    if (!layoutRef.current) return;
    if (!document.fullscreenElement) {
      layoutRef.current.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={layoutRef}
      className={`fixed inset-0 h-screen w-screen transition-colors duration-300 overflow-hidden flex flex-col z-50 select-none ${
        isDarkMode ? "bg-[#13151C] text-white" : "bg-[#F4F5F7] text-gray-900"
      }`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Scroll reading progress bar (Fixed at very top) */}
      <ReadingProgress currentPage={currentPage} totalPages={totalPages} />

      {/* Floating Toolbar */}
      <ReaderToolbar
        isVisible={isToolbarVisible}
        onBack={onBack}
        documentTitle={documentTitle}
        subjectBadge={subjectBadge}
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitWidth={handleFitWidth}
        onRotate={handleRotate}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        noteId={noteId}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
      />

      {/* Blur/Blackout Screen Protection Overlay */}
      {isBlurred && (
        <div className="absolute inset-0 bg-[#13151C]/98 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-50 transition-all duration-300">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 mb-4 animate-pulse">
            <EyeOff className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Security Suspended</h3>
          <p className="text-sm text-gray-400 mt-2.5 max-w-sm leading-relaxed">
            Note viewing is suspended while the tab or window is out of focus. Click inside this reader viewport to resume.
          </p>
        </div>
      )}

      {/* Main viewer viewport */}
      <div 
        ref={viewerRef}
        onScroll={handleScroll}
        className={`flex-grow w-full overflow-y-auto scrollbar-thin scroll-smooth pt-16 transition-colors duration-300 ${isDarkMode ? "bg-[#13151C]" : "bg-[#F4F5F7]"}`}
      >
        <div className="w-full flex justify-center">
          <PdfViewer
            pdfUrl={pdfUrl}
            zoom={zoom}
            rotation={rotation}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onTotalPagesChange={setTotalPages}
            viewerRef={viewerRef}
            user={user}
            noteId={noteId}
            setZoom={setZoom}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}
