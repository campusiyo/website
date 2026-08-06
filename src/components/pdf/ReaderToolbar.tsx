"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, ZoomIn, ZoomOut, Maximize2, Minimize2, 
  RotateCw, Sun, Moon, MoreVertical, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import DownloadButton from "./DownloadButton";
import { AnimatePresence, motion } from "framer-motion";

interface ReaderToolbarProps {
  isVisible: boolean;
  onBack: () => void;
  documentTitle: string;
  subjectBadge?: string;
  currentPage: number;
  totalPages: number;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onFitWidth: () => void;
  onRotate: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  noteId: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function ReaderToolbar({
  isVisible,
  onBack,
  documentTitle,
  subjectBadge,
  currentPage,
  totalPages,
  zoom,
  onZoomChange,
  onFitWidth,
  onRotate,
  isFullscreen,
  onToggleFullscreen,
  noteId,
  isDarkMode,
  onToggleDarkMode
}: ReaderToolbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Theme Styling Mappings
  const themeClasses = {
    header: isDarkMode 
      ? "bg-[#181C24] border-[#262B36]" 
      : "bg-white border-[#E5E7EB] shadow-sm",
    textMain: isDarkMode ? "text-white" : "text-gray-900",
    textSub: isDarkMode ? "text-gray-400" : "text-gray-500",
    textZoom: isDarkMode ? "text-gray-200" : "text-gray-800",
    btnMain: isDarkMode 
      ? "text-white border-[#262B36] hover:bg-[#262B36] hover:text-white" 
      : "text-gray-700 border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-gray-900",
    btnIcon: isDarkMode ? "text-gray-400" : "text-gray-500",
    divider: isDarkMode ? "bg-[#262B36]" : "bg-[#E5E7EB]",
    zoomContainer: isDarkMode ? "border-[#262B36] bg-[#13151C]" : "border-[#E5E7EB] bg-[#F9FAFB]",
    dropdown: isDarkMode ? "bg-[#181C24] border-[#262B36]" : "bg-white border-[#E5E7EB] shadow-2xl",
    dropdownBtn: isDarkMode
      ? "border-[#262B36] hover:bg-[#262B36] hover:text-white text-gray-200"
      : "border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-gray-900 text-gray-700",
    badge: isDarkMode
      ? "bg-[#00A16C]/10 text-[#00A16C] border-[#00A16C]/20"
      : "bg-[#00A16C]/8 text-[#008F5D] border-[#00A16C]/15"
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: -65, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -65, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={`fixed top-1 left-0 right-0 h-14 px-4 flex items-center justify-between z-40 select-none transition-colors duration-300 border-b ${themeClasses.header}`}
        >
          {/* ====================================================
              1. DESKTOP & TABLET VIEWPORTS (sm:flex)
             ==================================================== */}
          <div className="hidden sm:flex items-center justify-between w-full h-full">
            
            {/* Left Section: Back & Title */}
            <div className="flex items-center gap-4 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className={`h-10 gap-2 cursor-pointer active:scale-98 transition-all px-4 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#00A16C]/40 ${themeClasses.btnMain}`}
                title="Return to notes listing"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Button>
              <div className={`h-5 w-px shrink-0 transition-colors duration-300 ${themeClasses.divider}`} />
              <h1 className={`text-sm font-bold truncate max-w-[120px] md:max-w-xs lg:max-w-md xl:max-w-lg transition-colors duration-300 ${themeClasses.textMain}`} title={documentTitle}>
                {documentTitle}
              </h1>
              {subjectBadge && (
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 select-none border transition-colors duration-300 ${themeClasses.badge}`}>
                  {subjectBadge}
                </span>
              )}
            </div>

            {/* Middle Section: Pagination & Zoom & Rotation */}
            <div className="flex items-center gap-5">
              
              {/* Pagination Info */}
              <div className={`text-xs font-bold select-none transition-colors duration-300 ${themeClasses.textSub}`}>
                Page <span className={`text-sm transition-colors duration-300 ${themeClasses.textMain}`}>{currentPage}</span> / <span className="text-sm">{totalPages || "?"}</span>
              </div>

              {/* Enhanced Zoom controls */}
              <div className={`flex items-center gap-1 rounded-xl p-1 border transition-colors duration-300 ${themeClasses.zoomContainer}`}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
                  disabled={zoom <= 0.5}
                  className={`h-9 w-9 p-0 cursor-pointer border-0 rounded-lg focus:ring-2 focus:ring-[#00A16C]/30 disabled:opacity-30 transition-colors duration-300 ${themeClasses.btnMain}`}
                  title="Zoom Out"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <div className={`text-xs font-bold w-12 text-center select-none transition-colors duration-300 ${themeClasses.textZoom}`}>
                  {Math.round(zoom * 100)}%
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))}
                  disabled={zoom >= 2.0}
                  className={`h-9 w-9 p-0 cursor-pointer border-0 rounded-lg focus:ring-2 focus:ring-[#00A16C]/30 disabled:opacity-30 transition-colors duration-300 ${themeClasses.btnMain}`}
                  title="Zoom In"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>

              {/* Fit Width */}
              <Button
                variant="outline"
                size="sm"
                onClick={onFitWidth}
                className={`h-10 cursor-pointer px-3.5 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#00A16C]/30 transition-colors duration-300 ${themeClasses.btnMain}`}
                title="Fit to container width"
              >
                Fit Width
              </Button>

              {/* Rotate */}
              <Button
                variant="outline"
                size="sm"
                onClick={onRotate}
                className={`h-10 w-10 p-0 cursor-pointer rounded-xl focus:ring-2 focus:ring-[#00A16C]/30 transition-colors duration-300 ${themeClasses.btnMain}`}
                title="Rotate page 90° clockwise"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
            </div>

            {/* Right Section: Theme & Fullscreen & Download */}
            <div className="flex items-center gap-3">
              
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleDarkMode}
                className={`h-10 w-10 p-0 cursor-pointer rounded-xl focus:ring-2 focus:ring-[#00A16C]/30 transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20" 
                    : themeClasses.btnMain
                }`}
                title={isDarkMode ? "Switch to light note theme" : "Switch to dark note theme"}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Fullscreen */}
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleFullscreen}
                className={`h-10 w-10 p-0 cursor-pointer rounded-xl focus:ring-2 focus:ring-[#00A16C]/30 transition-colors duration-300 ${themeClasses.btnMain}`}
                title={isFullscreen ? "Exit Fullscreen Mode" : "Enter Fullscreen Mode"}
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
              
              {/* Download */}
              <DownloadButton noteId={noteId} documentTitle={documentTitle} isDarkMode={isDarkMode} />
            </div>
          </div>

          {/* ====================================================
              2. MOBILE VIEWPORTS (sm:hidden)
             ==================================================== */}
          <div className="flex sm:hidden items-center justify-between w-full h-full relative">
            
            {/* Back Icon Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className={`h-10 w-10 p-0 cursor-pointer rounded-xl focus:ring-2 focus:ring-[#00A16C]/30 transition-colors duration-300 ${themeClasses.btnMain}`}
              title="Return"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Document Title */}
            <div className="flex flex-col min-w-0 max-w-[130px] text-center select-none">
              <span className={`text-xs font-bold truncate px-1 transition-colors duration-300 ${themeClasses.textMain}`}>
                {documentTitle}
              </span>
              <span className={`text-[9px] font-semibold transition-colors duration-300 ${themeClasses.textSub}`}>
                Page {currentPage} of {totalPages || "?"}
              </span>
            </div>

            {/* Right side: Download & Overflow Dropdown Toggle */}
            <div className="flex items-center gap-2">
              
              <DownloadButton noteId={noteId} documentTitle={documentTitle} isDarkMode={isDarkMode} />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                className={`h-10 w-10 p-0 cursor-pointer rounded-xl focus:ring-2 focus:ring-[#00A16C]/30 transition-colors duration-300 ${
                  isMobileMenuOpen 
                    ? "bg-[#00A16C]/10 border-[#00A16C]/30 text-[#00A16C]" 
                    : themeClasses.btnMain
                }`}
                title="More Controls"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <MoreVertical className="h-5 w-5" />}
              </Button>
            </div>

            {/* Mobile Dropdown Panel */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 top-13 w-60 border rounded-2xl shadow-2xl p-4.5 space-y-4 z-50 transition-colors duration-300 ${themeClasses.dropdown}`}
                >
                  {/* Zoom controls */}
                  <div className="space-y-1.5">
                    <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors duration-300 ${themeClasses.textSub}`}>Scale View</span>
                    <div className={`flex items-center justify-between rounded-xl p-1 border transition-colors duration-300 ${themeClasses.zoomContainer}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
                        disabled={zoom <= 0.5}
                        className={`h-10 w-10 p-0 border-0 rounded-lg focus:ring-2 focus:ring-[#00A16C]/30 disabled:opacity-30 transition-colors duration-300 ${themeClasses.btnMain}`}
                      >
                        <ZoomOut className="h-5 w-5" />
                      </Button>
                      <span className={`text-xs font-bold transition-colors duration-300 ${themeClasses.textZoom}`}>{Math.round(zoom * 100)}%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))}
                        disabled={zoom >= 2.0}
                        className={`h-10 w-10 p-0 border-0 rounded-lg focus:ring-2 focus:ring-[#00A16C]/30 disabled:opacity-30 transition-colors duration-300 ${themeClasses.btnMain}`}
                      >
                        <ZoomIn className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Spacer separator */}
                  <div className={`h-px w-full transition-colors duration-300 ${themeClasses.divider}`} />

                  {/* Command Buttons */}
                  <div className="flex flex-col gap-2">
                    {/* Fit Width */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onFitWidth();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full h-10 text-xs font-semibold justify-start px-3.5 rounded-xl gap-2.5 focus:ring-2 focus:ring-[#00A16C]/30 transition-all duration-300 ${themeClasses.dropdownBtn}`}
                    >
                      <span>Fit Page Width</span>
                    </Button>

                    {/* Rotate */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onRotate();
                      }}
                      className={`w-full h-10 text-xs font-semibold justify-start px-3.5 rounded-xl gap-2.5 focus:ring-2 focus:ring-[#00A16C]/30 transition-all duration-300 ${themeClasses.dropdownBtn}`}
                    >
                      <RotateCw className="h-4.5 w-4.5" />
                      <span>Rotate Page 90°</span>
                    </Button>

                    {/* Fullscreen */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onToggleFullscreen();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full h-10 text-xs font-semibold justify-start px-3.5 rounded-xl gap-2.5 focus:ring-2 focus:ring-[#00A16C]/30 transition-all duration-300 ${themeClasses.dropdownBtn}`}
                    >
                      {isFullscreen ? (
                        <>
                          <Minimize2 className="h-4.5 w-4.5" />
                          <span>Exit Fullscreen</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-4.5 w-4.5" />
                          <span>Enter Fullscreen</span>
                        </>
                      )}
                    </Button>

                    {/* Theme Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onToggleDarkMode();
                      }}
                      className={`w-full h-10 text-xs font-semibold justify-start px-3.5 rounded-xl gap-2.5 focus:ring-2 focus:ring-[#00A16C]/30 transition-all duration-300 ${themeClasses.dropdownBtn}`}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="h-4.5 w-4.5 text-amber-500" />
                          <span>Light PDF Theme</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-4.5 w-4.5" />
                          <span>Dark PDF Theme</span>
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
