"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    // Check if user already joined waitlist previously in this browser
    const joined = localStorage.getItem("campusiyo_waitlist_joined");
    if (joined) {
      setIsJoined(true);
      setStatus("success");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid college or personal email address.");
      return;
    }

    setStatus("loading");

    // Simulate API delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.setItem("campusiyo_waitlist_joined", "true");
      localStorage.setItem("campusiyo_waitlist_email", email);
      setIsJoined(true);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white border border-accent-green/20 rounded-xl max-w-md mx-auto shadow-sm text-center">
        <CheckCircle2 className="h-10 w-10 text-accent-green mb-3" />
        <h3 className="text-lg font-semibold text-foreground">You&apos;re on the list!</h3>
        <p className="text-sm text-secondary-gray mt-1">
          Thank you for joining the Campusiyo waitlist. We will notify you as soon as notes for your university become available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="Enter your student email..."
            className="w-full px-4 py-3 bg-white border border-border-light rounded-lg text-foreground placeholder:text-foreground/40 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            disabled={status === "loading"}
            required
          />
        </div>
        <Button
          type="submit"
          variant="accent"
          isLoading={status === "loading"}
          className="whitespace-nowrap px-6 py-3"
        >
          Join Waitlist
        </Button>
      </form>
      {status === "error" && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 font-medium">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
