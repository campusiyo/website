import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import { Sparkles, Clock, ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "Campusiyo is launching soon. Join the waitlist to receive access to university study notes, revision materials, and exam questions.",
};

export default function ComingSoon() {
  return (
    <>
      <Navbar />

      <main className="flex-grow flex items-center justify-center bg-background py-16 sm:py-24">
        <div className="max-w-xl w-full px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-semibold mb-6 border border-accent-green/20">
            <Clock className="h-3.5 w-3.5" />
            <span>Under Active Development</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Feature Launching Soon
          </h1>
          <p className="mt-4 text-sm sm:text-base text-secondary-gray leading-relaxed max-w-md mx-auto">
            Our notes dashboards, upload portals, and AI revision summarizers are currently in private alpha. Join the waitlist to be invited when we deploy.
          </p>

          <div className="mt-10 bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4">
              Get notified when this feature is ready
            </h3>
            <WaitlistForm />
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Return to Home
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/features" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
              View Product Roadmap
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
