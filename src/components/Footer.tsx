"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus("success");
    setEmail("");
  };

  return (
    <footer className="bg-white border-t border-border-light">
      {/* Newsletter Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-border-light">
        <div className="lg:flex lg:items-center lg:justify-between bg-primary/5 rounded-2xl p-8 sm:p-12 gap-8">
          <div className="max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Stay ahead. Get notified about notes release.
            </h3>
            <p className="mt-2 text-sm sm:text-base text-secondary-gray">
              We send updates only when notes for new semesters and universities are uploaded. No spam, ever.
            </p>
          </div>
          <div className="mt-8 lg:mt-0 lg:ml-8 w-full max-w-md">
            {status === "success" ? (
              <div className="flex items-center gap-2 text-accent-green font-medium">
                <CheckCircle2 className="h-5 w-5" />
                <span>Subscribed successfully! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white border border-border-light rounded-lg text-foreground placeholder:text-foreground/45 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={status === "loading"}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={status === "loading"}
                  className="whitespace-nowrap sm:w-auto"
                >
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Pitch */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Campusiyo Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold text-xl tracking-tight text-foreground">
                Campusiyo
              </span>
            </Link>
            <p className="text-sm text-secondary-gray leading-relaxed max-w-sm">
              The premier platform for university-specific, high-quality study materials. Built by students, for students.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="#"
                className="text-secondary-gray hover:text-primary transition-colors"
                aria-label="Twitter Link"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-secondary-gray hover:text-primary transition-colors"
                aria-label="GitHub Link"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="#"
                className="text-secondary-gray hover:text-primary transition-colors"
                aria-label="LinkedIn Link"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              Website
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  Features Roadmap
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/contact#faq" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  Supported Universities
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  Contribute Notes
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  Subject Index
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="text-sm text-secondary-gray hover:text-primary transition-colors">
                  Copyright Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright banner */}
        <div className="mt-12 pt-8 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-secondary-gray">
            &copy; {new Date().getFullYear()} Campusiyo. All rights reserved.
          </p>
          <p className="text-xs text-secondary-gray flex items-center gap-1">
            Made with dedication for students worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
