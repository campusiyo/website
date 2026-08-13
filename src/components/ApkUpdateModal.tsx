"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Sparkles, AlertTriangle, ShieldCheck, X } from "lucide-react";

declare global {
  interface Window {
    CampusiyoNative?: {
      getVersionCode: () => number;
      getVersionName: () => string;
      isNativeApp: () => boolean;
    };
    Capacitor?: {
      isNativePlatform: () => boolean;
    };
  }
}

interface ApkVersionManifest {
  versionName: string;
  versionCode: number;
  downloadUrl: string;
  releaseNotes?: string;
  minimumVersionCode?: number;
}

export default function ApkUpdateModal() {
  const [showModal, setShowModal] = useState(false);
  const [manifest, setManifest] = useState<ApkVersionManifest | null>(null);
  const [installedCode, setInstalledCode] = useState<number>(1);
  const [installedName, setInstalledName] = useState<string>("1.0.0");
  const [isMandatory, setIsMandatory] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running inside native Android application
    const isNative =
      Boolean(window.CampusiyoNative?.isNativeApp()) ||
      Boolean(window.Capacitor?.isNativePlatform());

    // Only run update check if inside APK
    if (!isNative) return;

    const currentCode = window.CampusiyoNative?.getVersionCode() ?? 1;
    const currentName = window.CampusiyoNative?.getVersionName() ?? "1.0.0";
    setInstalledCode(currentCode);
    setInstalledName(currentName);

    // Fetch remote authoritative version manifest
    const checkVersion = async () => {
      try {
        const res = await fetch("/apk-version.json?t=" + Date.now(), {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data: ApkVersionManifest = await res.json();
        setManifest(data);

        const latestCode = data.versionCode;
        const minRequiredCode = data.minimumVersionCode ?? 1;

        // Semantically compare version codes (monotonically increasing integers)
        if (latestCode > currentCode) {
          const mandatory = currentCode < minRequiredCode;
          setIsMandatory(mandatory);

          if (!mandatory) {
            // Check 24-hour dismissal cache for optional updates
            const dismissedCode = localStorage.getItem("campusiyo_update_dismissed_code");
            const dismissedTime = localStorage.getItem("campusiyo_update_dismissed_time");

            if (dismissedCode === String(latestCode) && dismissedTime) {
              const elapsedHours = (Date.now() - Number(dismissedTime)) / (1000 * 60 * 60);
              if (elapsedHours < 24) {
                return; // User dismissed within last 24h for this version
              }
            }
          }

          setShowModal(true);
        }
      } catch {
        // Silent fail-safe: offline or network issue must never block normal app usage
      }
    };

    checkVersion();
  }, []);

  // Lock body scroll while update modal is open
  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);

  const handleUpdateClick = () => {
    const url = manifest?.downloadUrl || "/Campusiyo.apk";
    window.location.href = url;
  };

  const handleLaterClick = () => {
    if (manifest) {
      localStorage.setItem("campusiyo_update_dismissed_code", String(manifest.versionCode));
      localStorage.setItem("campusiyo_update_dismissed_time", String(Date.now()));
    }
    setShowModal(false);
  };

  if (!showModal || !manifest) return null;

  const notesList = manifest.releaseNotes
    ? manifest.releaseNotes.split("\n").filter(Boolean)
    : [
        "• Bug fixes and performance improvements",
        "• Updated security protections and stability",
      ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isMandatory) handleLaterClick();
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-md bg-[#181C24] border border-[#00A16C]/30 rounded-2xl p-6 shadow-2xl z-10 text-white overflow-hidden"
        >
          {/* Header Accent Glow */}
          <div className="absolute -top-12 -left-12 h-36 w-36 bg-[#00A16C]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button (only if optional) */}
          {!isMandatory && (
            <button
              onClick={handleLaterClick}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Header Icon + Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-xl bg-[#00A16C]/15 border border-[#00A16C]/30 flex items-center justify-center text-[#00A16C] shrink-0">
              {isMandatory ? (
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              ) : (
                <Sparkles className="h-6 w-6 text-[#00A16C]" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold leading-snug text-white">
                {isMandatory ? "Critical Update Required" : "Campusiyo Update Available"}
              </h3>
              <p className="text-xs text-gray-400">
                {isMandatory
                  ? "Please update to continue using Campusiyo"
                  : "A newer version of the Campusiyo app is ready"}
              </p>
            </div>
          </div>

          {/* Version Tags */}
          <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
            <span className="text-gray-400">
              Installed: <strong className="text-gray-200">v{installedName}</strong> ({installedCode})
            </span>
            <span className="text-gray-600">→</span>
            <span className="text-[#00A16C] font-semibold">
              Available: <strong>v{manifest.versionName}</strong> ({manifest.versionCode})
            </span>
          </div>

          {/* Release Notes */}
          <div className="mb-6 space-y-1.5 text-xs text-gray-300 bg-white/5 p-3.5 rounded-xl border border-white/5">
            <p className="font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#00A16C]" /> What&apos;s new in this release:
            </p>
            {notesList.map((note, idx) => (
              <p key={idx} className="leading-relaxed">
                {note}
              </p>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isMandatory && (
              <button
                onClick={handleLaterClick}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold transition-all cursor-pointer text-center"
              >
                Later
              </button>
            )}
            <button
              onClick={handleUpdateClick}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#00A16C] hover:bg-[#008f5f] text-white text-sm font-bold transition-all cursor-pointer shadow-lg shadow-[#00A16C]/25 flex items-center justify-center gap-2 text-center"
            >
              <Download className="h-4 w-4" />
              <span>Update App</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
