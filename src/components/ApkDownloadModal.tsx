"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

const STORAGE_KEY = "campusiyo_apk_popup_dismissed_v1";

export default function ApkDownloadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const isDismissed = localStorage.getItem(STORAGE_KEY);
      if (!isDismissed) {
        // Show modal on first visit after a slight smooth delay
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("Failed to read APK popup status from localStorage:", e);
    }
  }, []);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (e) {
      console.error("Failed to save APK popup status to localStorage:", e);
    }
    setIsOpen(false);
  };

  const handleDownload = () => {
    handleDismiss();
    // Trigger download of existing APK asset
    const link = document.createElement("a");
    link.href = "/Campusiyo.apk";
    link.download = "Campusiyo.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-card-bg border border-border-light rounded-3xl shadow-2xl overflow-hidden z-10 text-foreground"
          >
            {/* Ambient Brand Top Banner Accent */}
            <div className="h-2 w-full bg-gradient-to-r from-primary via-emerald-400 to-teal-500" />

            {/* Close Button X */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full border border-border-light text-secondary-gray hover:text-foreground hover:bg-hover-card-bg transition-colors cursor-pointer"
              aria-label="Close download popup"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              {/* Header Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Smartphone className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Android 15 Verified</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground leading-snug">
                    Get the Campusiyo Mobile App
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-secondary-gray leading-relaxed">
                Study university notes, semester course guides, and previous year papers faster with the official native Android app.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-2.5 bg-background/60 border border-border-light/60 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  <span>Ultra-fast document loading & smooth reader</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>100% ad-free & distraction-free interface</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Download className="h-4 w-4" />
                  <span>Download APK</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl border border-border-light text-secondary-gray hover:text-foreground hover:bg-hover-card-bg text-sm font-semibold transition-colors cursor-pointer text-center"
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
