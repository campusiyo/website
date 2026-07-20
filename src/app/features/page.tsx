import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";
import { ArrowRight, Sparkles, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap & Features",
  description: "Explore the core features of Campusiyo and our pre-launch roadmap, including upcoming AI summaries, practice quizzes, and organized exam preparation tools.",
};

const LAUNCH_FEATURES = [
  {
    iconName: "GraduationCap" as const,
    title: "University Syllabus Matching",
    description: "No generic topics. Notes are mapped and structured precisely to your university syllabus and course codes.",
  },
  {
    iconName: "Layers" as const,
    title: "Semester-wise Portals",
    description: "Easily navigate subjects organized semester by semester, from freshmen courses to senior capstones.",
  },
  {
    iconName: "Search" as const,
    title: "Curriculum Search",
    description: "Search specific modules, syllabus topics, or unit breakdowns to locate relevant documents instantly.",
  },
  {
    iconName: "FileText" as const,
    title: "Embedded PDF Viewer",
    description: "Read, zoom, and scroll through notes in our speedy mobile-responsive browser reader without heavy downloads.",
  },
  {
    iconName: "Award" as const,
    title: "Previous Year Question Papers",
    description: "Access past exam papers matching your university, paired with step-by-step solutions compiled by top students.",
  },
  {
    iconName: "Bookmark" as const,
    title: "Exam Bookmarks",
    description: "Save high-frequency questions, formula lists, or specific notes to your profile for easy access on exam day.",
  },
];

const ROADMAP_FEATURES = [
  {
    iconName: "Sparkles" as const,
    title: "AI Note Summaries",
    description: "Instantly condense dense 100-page lecture slides or PDFs into structured 10-point revision summaries using our context-aware AI models.",
    isComingSoon: true,
  },
  {
    iconName: "BookOpen" as const,
    title: "AI Practice Quizzes",
    description: "Auto-generate mock multiple-choice and short-answer quizzes based on your uploaded university notes to test your exam-readiness.",
    isComingSoon: true,
  },
  {
    iconName: "Users" as const,
    title: "Premium Study Guides",
    description: "Access masterclass study decks, expert-authored textbook guides, and premium solved guides for tricky math and science courses.",
    isComingSoon: true,
  },
];

export default function Features() {
  return (
    <>
      <Navbar />

      <main className="flex-grow">
        {/* Page Hero */}
        <section className="bg-white border-b border-border-light py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Features & Roadmap
            </h1>
            <p className="mt-6 text-base sm:text-lg text-secondary-gray leading-relaxed max-w-2xl mx-auto">
              Campusiyo is engineered to simplify college exam preparation. Here is a breakdown of what will be available on day one, and the smart features we are building next.
            </p>
          </div>
        </section>

        {/* Day 1 Features */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Version 1.0</h2>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-2">
              Ready at Launch
            </p>
            <p className="text-sm text-secondary-gray mt-2">
              Core utilities created to help you scrap chaotic folders and find notes in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {LAUNCH_FEATURES.map((feature, idx) => (
              <FeatureCard
                key={idx}
                iconName={feature.iconName}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        {/* Coming Soon Features */}
        <section className="bg-white border-y border-border-light py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12 sm:mb-16">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-semibold mb-4 border border-accent-green/20">
                <Sparkles className="h-3 w-3" />
                Under Development
              </span>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Roadmap: What We Are Building Next
              </p>
              <p className="text-sm text-secondary-gray mt-2">
                We are leveraging advanced AI and expert student collaborations to build smart, active study aids.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {ROADMAP_FEATURES.map((feature, idx) => (
                <FeatureCard
                  key={idx}
                  iconName={feature.iconName}
                  title={feature.title}
                  description={feature.description}
                  isComingSoon={feature.isComingSoon}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Feature Request callout */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto bg-primary/5 border border-primary/10 rounded-2xl p-8 sm:p-16">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Is there a feature you want?
            </h3>
            <p className="text-sm text-secondary-gray mt-3 max-w-lg mx-auto leading-relaxed">
              We shape our roadmap based on student requests. If there is an integration or format you would love to see, tell us.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button variant="primary">
                  Request a Feature
                </Button>
              </Link>
              <Link href="/#waitlist">
                <Button variant="outline" className="group">
                  Join The Waitlist
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
