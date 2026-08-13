"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

interface LoginRequiredOverlayProps {
  onClose?: () => void;
}

export default function LoginRequiredOverlay({ onClose }: LoginRequiredOverlayProps) {
  const router = useRouter();

  const handleSecondaryClick = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-card-bg border border-border-light rounded-3xl p-5 sm:p-6 max-w-[360px] w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
          <ShieldAlert className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Please Log In
        </h3>
        <p className="text-[13px] sm:text-sm text-secondary-gray mt-2 leading-relaxed">
          To explore courses, subjects, and view study materials, you need to sign in to your Campusiyo account.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => router.push("/login")}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={handleSecondaryClick}
            className="flex-1 py-2.5 px-4 rounded-xl bg-card-bg border border-border-light hover:bg-gray-50 dark:hover:bg-slate-800 text-foreground text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            {onClose ? "Cancel" : "Go to Homepage"}
          </button>
        </div>
      </div>
    </div>
  );
}
