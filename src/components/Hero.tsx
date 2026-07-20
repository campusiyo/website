"use client";

import React from "react";
import { motion } from "framer-motion";
import WaitlistForm from "@/components/WaitlistForm";
import { Sparkles, Bookmark, BookOpen, GraduationCap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-32">
      {/* Background decoration - subtle, minimal patterns */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-40">
        <div className="h-[400px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="h-[300px] w-[400px] rounded-full bg-accent-green/5 blur-3xl ml-40 mt-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/5 text-primary text-xs sm:text-sm font-semibold border border-primary/10 mb-8"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Pre-launching for the 2026 Academic Year</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]"
        >
          Find Organized Notes <br className="hidden sm:inline" />
          for Your <span className="text-primary relative inline-block">
            University.
            <span className="absolute left-0 bottom-1 w-full h-1 bg-accent-green/30 rounded-full -z-10" />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-secondary-gray max-w-2xl mx-auto leading-relaxed"
        >
          Skip the endless scrolling through messy WhatsApp groups and chaotic folders. 
          Get peer-reviewed, semester-wise study materials tailored precisely to your syllabus.
        </motion.p>

        {/* Waitlist Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 max-w-md mx-auto"
          id="waitlist"
        >
          <WaitlistForm />
          <p className="mt-3.5 text-xs text-secondary-gray">
            Join 1,200+ students from top universities already on the waitlist.
          </p>
        </motion.div>

        {/* Quick Highlights / Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto border-t border-border-light pt-10"
        >
          <div className="flex items-center justify-center gap-2.5 text-left">
            <div className="p-2 bg-primary/5 rounded-lg text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">University syllabus</p>
              <p className="text-xs text-secondary-gray">100% matched mapping</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 text-left">
            <div className="p-2 bg-primary/5 rounded-lg text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Peer-Reviewed</p>
              <p className="text-xs text-secondary-gray">Verified by top students</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 text-left col-span-2 md:col-span-1">
            <div className="p-2 bg-primary/5 rounded-lg text-primary">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Fully Free</p>
              <p className="text-xs text-secondary-gray">Open access in beta</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
