"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete?: () => void;
  autoDismiss?: boolean;
  className?: string;
}

export default function SplashScreen({
  onComplete,
  autoDismiss = true,
  className = "",
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoDismiss) return;

    // Timeline overview (1.2s optimal startup duration):
    // 0.0 - 0.2s: Background + Ambient Glow
    // 0.2 - 0.6s: Logo arc reveal & draw
    // 0.6 - 0.9s: "Campusiyo" text slide + fade in
    // 1.0 - 1.2s: Smooth fade-out transition
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 200); // 200ms fade-out buffer
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoDismiss, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0D12] text-white select-none overflow-hidden ${className}`}
        >
          {/* Ambient Background Radial Glow (0.0s - 0.3s) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: [0, 0.45, 0.3],
              scale: [0.7, 1.1, 1.0],
            }}
            transition={{
              duration: 1.2,
              times: [0, 0.6, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute h-[340px] w-[340px] rounded-full bg-radial from-[#00A16C]/30 via-[#00D2FF]/15 to-transparent blur-3xl pointer-events-none"
          />

          {/* Logo Container */}
          <div className="relative flex flex-col items-center justify-center z-10 px-4">
            
            {/* Pulsing Light Ring around logo (1.6s - 1.9s) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: [0, 0, 0.6, 0],
                scale: [0.85, 0.85, 1.25, 1.35],
              }}
              transition={{
                duration: 1.9,
                times: [0, 0.75, 0.88, 1],
                ease: "easeOut",
              }}
              className="absolute h-24 w-24 rounded-full border border-[#00A16C]/40 pointer-events-none"
            />

            {/* Vector Brand Logo Icon (0.3s - 1.3s) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.0 }}
              transition={{
                duration: 0.9,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative h-24 w-24 flex items-center justify-center"
            >
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full drop-shadow-[0_8px_24px_rgba(0,161,108,0.35)]"
              >
                <defs>
                  {/* Primary Campusiyo Brand Gradient (Teal Green to Electric Cyan) */}
                  <linearGradient id="campusiyoPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00A16C" />
                    <stop offset="60%" stopColor="#00D2FF" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>

                  {/* Inner Accent Gradient (Gold to Emerald) */}
                  <linearGradient id="campusiyoAccentGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  {/* Drop Shadow Filter for Vector Elements */}
                  <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Outer Smooth Circular "C" Arc Draw Path (0.15s - 0.6s) */}
                <motion.path
                  d="M 72,28 A 36,36 0 1 0 72,72"
                  fill="none"
                  stroke="url(#campusiyoPrimaryGrad)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { duration: 0.45, delay: 0.15, ease: [0.25, 1, 0.5, 1] },
                    opacity: { duration: 0.1, delay: 0.15 },
                  }}
                />

                {/* Inner Book / Curriculum Page Leaf Accent */}
                <motion.path
                  d="M 44,38 C 44,38 58,40 64,50 C 70,60 62,70 50,70 C 44,70 40,64 40,58 C 40,48 44,38 44,38 Z"
                  fill="url(#campusiyoAccentGrad)"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.95 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.45,
                    ease: [0.34, 1.56, 0.64, 1], // subtle spring pop
                  }}
                />

                {/* Sparkling Academic Dot */}
                <motion.circle
                  cx="72"
                  cy="28"
                  r="5.5"
                  fill="#00D2FF"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.25,
                    delay: 0.6,
                    ease: "backOut",
                  }}
                />
              </svg>
            </motion.div>

            {/* "Campusiyo" Typography + Tagline (0.6s - 0.9s) */}
            <div className="mt-6 flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-center gap-1"
              >
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-white">
                  Campus<span className="text-[#00A16C]">iyo</span>
                </span>
              </motion.div>

              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.65, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-1.5 text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-gray-300 uppercase"
              >
                University Study Portal
              </motion.span>
            </div>

          </div>

          {/* Minimalist Bottom Loading Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.4, delay: 1.4 }}
            className="absolute bottom-10 flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#00A16C] animate-ping" />
            <span className="text-[11px] font-medium tracking-widest text-gray-400 uppercase">
              Loading Portal...
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
