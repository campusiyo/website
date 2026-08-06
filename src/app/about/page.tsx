import React from "react";
import { GraduationCap, Eye, Compass, ShieldCheck, Heart, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the mission, vision, and story behind Campusiyo — a platform built to organize college notes and help Indian university students study smarter and ace their exams.",
  alternates: { canonical: "https://campusiyo.in/about" },
  openGraph: {
    title: "About Us | Campusiyo",
    description: "Learn the story behind Campusiyo — built by students, for students.",
    url: "https://campusiyo.in/about",
  },
};

export default function About() {
  return (
    <main className="flex-grow">
      {/* Intro Hero Section */}
      <section className="relative overflow-hidden border-b border-border-light py-10 sm:py-28">
        {/* Background image with low opacity */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/du-gate.jpg"
            alt="college gate image"
            className="w-full h-full object-cover opacity-50 dark:opacity-[0.5] transition-opacity"
          />
          {/* Subtle overlay gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-card-bg/40 via-card-bg/70 to-card-bg" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Our Story
          </h1>
          <p className="mt-6 text-base sm:text-lg text-secondary-gray leading-relaxed max-w-2xl mx-auto">
            Campusiyo started with a simple observation: college students spend more time searching for high-quality study materials than actually studying. We set out to change that.
          </p>
        </div>
      </section>

      {/* Why Campusiyo Exists - The Problem */}
      <section className="sm:py-15 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="sm:space-y-6 space-y-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">The Problem We Solve</h2>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              Everything in One Place.
            </p>
            <p className="text-sm sm:text-base text-secondary-gray leading-relaxed">
              Before exams, WhatsApp and Telegram groups become overwhelming. Important notes disappear under hundreds of messages, hundreds of unnecessary files and outdated PDFs keep circulating, and students waste hours figuring out which files are actually correct.
            </p>
            <p className="text-sm sm:text-base text-secondary-gray leading-relaxed">
              Many students also download notes from unsecured websites or APKs, putting their devices and personal data at risk.
            </p>
            <p className="text-sm sm:text-base text-secondary-gray leading-relaxed">
              Campusiyo brings verified, organized study resources into one secure place. Find the right notes instantly, stay away from unnecessary groups, and never rely on unsafe downloads just to prepare for your exams.
            </p>
          </div>

          <div className="bg-card-bg border border-border-light rounded-2xl p-8 shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-foreground text-lg border-b border-border-light pb-4">
              What makes Campusiyo different?
            </h3>
            
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-primary/5 rounded-lg text-primary shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">Syllabus-Centric Architecture</h4>
                <p className="text-xs sm:text-sm text-secondary-gray mt-1">
                  Instead of generic notes tagged with arbitrary search words, we build study desks around official course codes and semesters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-primary/5 rounded-lg text-primary shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">Peer Verification</h4>
                <p className="text-xs sm:text-sm text-secondary-gray mt-1">
                  We vet uploads using a rating standard to ensure files are neat, correct, and matching the professor&apos;s lectures.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-primary/5 rounded-lg text-primary shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">Minimalist & Fast Interface</h4>
                <p className="text-xs sm:text-sm text-secondary-gray mt-1">
                  No spam banners, no paywall redirections, and no heavy elements. Load notes instantly, even on weak campus networks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision Grid */}
      <section className="bg-background border-y border-border-light py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {/* Mission */}
          <div className="p-8 border border-border-light rounded-2xl flex flex-col gap-4 bg-card-bg">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/5 text-primary">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Our Mission</h3>
            <p className="text-sm sm:text-base text-secondary-gray leading-relaxed">
              To build the world&apos;s most reliable, open, and cleanly structured repository of university study notes. We want to empower students to learn efficiently, help academic high-achievers share their hard work, and reduce the prep stress that surrounds university examinations.
            </p>
          </div>

          {/* Vision */}
          <div className="p-8 border border-border-light rounded-2xl flex flex-col gap-4 bg-card-bg">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/5 text-primary">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Our Vision</h3>
            <p className="text-sm sm:text-base text-secondary-gray leading-relaxed">
              We envision a unified academic hub where any student can query their college, program, and semester, and receive instant, high-quality, peer-reviewed learning cards, revision sheets, and past solutions. A collaborative future where student knowledge benefits generations to come.
            </p>
          </div>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section className="py-8 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Brand Values</h2>
          <p className="text-3xl font-bold tracking-tight text-foreground mt-3">
            The values that drive us.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Value 1 */}
          <div className="flex flex-col gap-3">
            <div className="h-10 w-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-foreground text-lg">Absolute Trust</h4>
            <p className="text-sm text-secondary-gray leading-relaxed">
              We believe study materials must be accurate and reliable. We maintain strict review policies to verify that notes map to the corresponding university curriculums.
            </p>
          </div>

          {/* Value 2 */}
          <div className="flex flex-col gap-3">
            <div className="h-10 w-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-foreground text-lg">Accessibility First</h4>
            <p className="text-sm text-secondary-gray leading-relaxed">
              Access to quality study resources shouldn&apos;t depend on student connections or social status. Core summaries are and always will be accessible without paywalls.
            </p>
          </div>

          {/* Value 3 */}
          <div className="flex flex-col gap-3">
            <div className="h-10 w-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-foreground text-lg">Student-Centric design</h4>
            <p className="text-sm text-secondary-gray leading-relaxed">
              We don&apos;t fill our layouts with ads or complex clicks. Every feature is handcrafted to deliver notes to your screen in the fewest clicks possible.
            </p>
          </div>
        </div>
      </section>

      {/* Support Pre-launch Callout */}
      <section className="bg-primary dark:bg-background border-y border-white/15 text-white py-8 sm:py-16 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Join the student movement.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/80 max-w-lg mx-auto">
            Help us democratize notes. Join the waitlist to receive updates on how to submit your materials and represent Campusiyo at your campus.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/#waitlist">
              <Button variant="accent" size="lg">
                Join The Waitlist
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-card-bg/10">
                Contact The Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
