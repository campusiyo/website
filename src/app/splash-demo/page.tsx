"use client";

import React, { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Play, RotateCcw, Smartphone, Tablet, Monitor, CheckCircle2, Code2, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SplashDemoPage() {
  const [key, setKey] = useState(0);
  const [deviceMode, setDeviceMode] = useState<"mobile" | "tablet" | "fullscreen">("mobile");
  const [isPlaying, setIsPlaying] = useState(true);

  const handleReplay = () => {
    setIsPlaying(false);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsPlaying(true), 50);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-light pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Campusiyo Mobile Brand Assets</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Mobile Splash Screen Animation Demo
              </h1>
              <p className="text-sm text-secondary-gray mt-1 max-w-2xl">
                Vector-based 60 FPS startup splash screen for Campusiyo Android & iOS mobile app build. Clean, lightweight, non-pixelated logo reveal with smooth spring physics easing.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={handleReplay}
                className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-md"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Replay Animation</span>
              </Button>
            </div>
          </div>

          {/* Device Controls & Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Device Simulator Workspace */}
            <div className="lg:col-span-7 flex flex-col items-center bg-card-bg border border-border-light rounded-3xl p-6 sm:p-8 shadow-sm">
              
              {/* Viewport Selectors */}
              <div className="flex items-center gap-2 p-1.5 bg-background border border-border-light rounded-2xl mb-8">
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deviceMode === "mobile"
                      ? "bg-primary text-white shadow-sm"
                      : "text-secondary-gray hover:text-foreground"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile Phone (9:19.5)</span>
                </button>
                
                <button
                  onClick={() => setDeviceMode("tablet")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deviceMode === "tablet"
                      ? "bg-primary text-white shadow-sm"
                      : "text-secondary-gray hover:text-foreground"
                  }`}
                >
                  <Tablet className="h-4 w-4" />
                  <span>Tablet (4:3)</span>
                </button>

                <button
                  onClick={() => setDeviceMode("fullscreen")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deviceMode === "fullscreen"
                      ? "bg-primary text-white shadow-sm"
                      : "text-secondary-gray hover:text-foreground"
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  <span>Full Viewport</span>
                </button>
              </div>

              {/* Simulated Mobile Mockup Frame */}
              <div className="relative flex justify-center w-full min-h-[580px] items-center">
                {deviceMode === "mobile" && (
                  <div className="relative w-[320px] h-[640px] bg-[#0A0C10] rounded-[48px] border-[10px] border-[#1E2330] shadow-2xl overflow-hidden ring-1 ring-white/10">
                    {/* Speaker Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#1E2330] rounded-b-2xl z-[110] flex items-center justify-center">
                      <div className="w-10 h-1 bg-gray-700 rounded-full" />
                    </div>

                    {/* Interactive Splash Screen */}
                    {isPlaying && (
                      <SplashScreen key={key} autoDismiss={false} className="!absolute" />
                    )}

                    {/* Bottom Indicator Bar */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-[110]" />
                  </div>
                )}

                {deviceMode === "tablet" && (
                  <div className="relative w-[480px] h-[580px] bg-[#0A0C10] rounded-[36px] border-[12px] border-[#1E2330] shadow-2xl overflow-hidden ring-1 ring-white/10">
                    {isPlaying && (
                      <SplashScreen key={key} autoDismiss={false} className="!absolute" />
                    )}
                  </div>
                )}

                {deviceMode === "fullscreen" && (
                  <div className="relative w-full h-[520px] bg-[#0A0C10] rounded-2xl border border-border-light shadow-xl overflow-hidden">
                    {isPlaying && (
                      <SplashScreen key={key} autoDismiss={false} className="!absolute" />
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-secondary-gray mt-6 text-center">
                Interactive preview rendering vector graphics at native display refresh rate.
              </p>
            </div>

            {/* Right: Spec & Timing Breakdown */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Animation Timeline Card */}
              <div className="bg-card-bg border border-border-light rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Precision Timing Matrix</span>
                </h3>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-background border border-border-light text-xs">
                    <span className="font-extrabold text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">0.0–0.3s</span>
                    <div>
                      <span className="font-bold text-foreground block">Dark Canvas & Radial Glow</span>
                      <span className="text-secondary-gray text-[11px]">Subtle #00A16C emerald ambient aura expands behind screen center.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-background border border-border-light text-xs">
                    <span className="font-extrabold text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">0.3–0.9s</span>
                    <div>
                      <span className="font-bold text-foreground block">Vector "C" Arc Draw</span>
                      <span className="text-secondary-gray text-[11px]">Clockwise path reveal of Campusiyo gradient icon with zero pixel distortion.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-background border border-border-light text-xs">
                    <span className="font-extrabold text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">0.9–1.3s</span>
                    <div>
                      <span className="font-bold text-foreground block">Spring Settle Scale</span>
                      <span className="text-secondary-gray text-[11px]">Icon smoothly decelerates from 80% to 100% using cubic-bezier(0.16, 1, 0.3, 1).</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-background border border-border-light text-xs">
                    <span className="font-extrabold text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">1.1–1.6s</span>
                    <div>
                      <span className="font-bold text-foreground block">Typography Slide & Fade</span>
                      <span className="text-secondary-gray text-[11px]">"Campusiyo" brand typography and tagline slide up with opacity transition.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-background border border-border-light text-xs">
                    <span className="font-extrabold text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">1.6–1.9s</span>
                    <div>
                      <span className="font-bold text-foreground block">Subtle Light Pulse</span>
                      <span className="text-secondary-gray text-[11px]">Delicate ring pulse radiates outward before main app transition.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Implementation Code Sample Card */}
              <div className="bg-card-bg border border-border-light rounded-3xl p-6 shadow-sm space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-accent-green" />
                  <span>Mobile Integration Code</span>
                </h3>
                <p className="text-xs text-secondary-gray leading-relaxed">
                  Import the lightweight component directly into Next.js, React Native, or Capacitor app shell:
                </p>

                <div className="bg-[#0B0D12] text-gray-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-border-light/50">
                  <pre>{`import SplashScreen from "@/components/SplashScreen";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <MainAppContent />
      )}
    </>
  );
}`}</pre>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
