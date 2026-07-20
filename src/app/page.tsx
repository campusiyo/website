import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";
import { Accordion } from "@/components/ui/Accordion";
import Footer from "@/components/Footer";
import { Check, X, ArrowRight, BookOpen, GraduationCap, Search, FileText, Bookmark, Users, ShieldCheck, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// FAQ items
const FAQ_ITEMS = [
  {
    question: "What is Campusiyo?",
    answer: "Campusiyo is a premium study resource platform designed to help college students find organized, university-specific, and semester-specific notes, lecture slides, and past exam papers. Our mission is to make quality study prep accessible, structured, and syllabus-matched.",
  },
  {
    question: "Is Campusiyo active right now?",
    answer: "Currently, Campusiyo is in its pre-launch phase. We are collaborating with student committees, top academic scorers, and professors to build our initial repository. By joining the waitlist, you'll get early access to the beta release and notes matching your exact syllabus as soon as we launch.",
  },
  {
    question: "How do you ensure the quality of notes?",
    answer: "Every piece of study material submitted to Campusiyo goes through a peer-review queue. We verify notes against official university curricula to ensure accuracy, legibility, and relevance before they are published.",
  },
  {
    question: "Will Campusiyo be free to use?",
    answer: "Yes, our core repository of study notes, syllabus indexes, and semester guides will be fully free during our open beta. Premium notes, AI-generated summaries, and exam-readiness quizzes will be introduced as advanced features later on.",
  },
  {
    question: "How can I contribute my notes?",
    answer: "We welcome contributions from academic high-achievers! Once the beta launches, you will be able to upload your neat digital or scanned notes. Select contributors will earn verification badges and rewards. Join our waitlist to receive instructions on note submissions.",
  },
];

// Universities and subjects placeholders
const UNIVERSITIES = [
  { name: "Delhi University", location: "New Delhi" },
  { name: "Mumbai University", location: "Mumbai" },
  { name: "VTU", location: "Karnataka" },
  { name: "IP University", location: "New Delhi" },
  { name: "Stanford University", location: "California (Demo)" },
  { name: "New York University", location: "New York (Demo)" },
];

const POPULAR_SUBJECTS = [
  "Data Structures & Algorithms",
  "Macroeconomic Theory",
  "Organic Chemistry",
  "Calculus & Linear Algebra",
  "Introduction to Psychology",
  "Operating Systems",
  "Corporate Finance",
  "Digital Signal Processing",
];

export default function Home() {
  // Structured Data Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Campusiyo",
    "url": "https://campusiyo.in",
    "description": "Get access to organized, peer-reviewed, university-wise and semester-wise study notes.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://campusiyo.in/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Trusted By Section (Subtle badge list) */}
        <section className="bg-white border-y border-border-light py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold text-secondary-gray uppercase tracking-widest mb-6">
              Notes planned for major universities
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
              {UNIVERSITIES.slice(0, 4).map((uni, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span className="font-bold text-foreground text-sm tracking-tight">{uni.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Campusiyo (Problem vs Solution) */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">The Study Scramble</h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
              Why traditional exam prep is broken.
            </p>
            <p className="text-sm sm:text-base text-secondary-gray mt-4 max-w-xl mx-auto">
              Every college student knows the anxiety of final exam week. The struggle isn&apos;t just studying—it&apos;s finding what to study.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-5xl mx-auto">
            {/* The Problem */}
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-8 flex flex-col gap-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-red-100 text-red-600">
                <X className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Before Campusiyo</h3>
                <p className="text-sm text-secondary-gray mt-2 leading-relaxed">
                  Scrambling through bloated Google Drives, searching WhatsApp chats for PDF links, sorting through handwritten notes with missing pages, and studying outdated resources that don&apos;t match this semester&apos;s syllabus.
                </p>
              </div>
              <ul className="space-y-3 mt-2 border-t border-red-100/50 pt-4">
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 font-bold text-xs mt-0.5">&minus;</span>
                  <span>Hours wasted searching instead of studying</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 font-bold text-xs mt-0.5">&minus;</span>
                  <span>Unreliable materials from unverified sources</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 font-bold text-xs mt-0.5">&minus;</span>
                  <span>Syllabus mismatches causing exam surprises</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-8 flex flex-col gap-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-100 text-accent-green">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">With Campusiyo</h3>
                <p className="text-sm text-secondary-gray mt-2 leading-relaxed">
                  A centralized, tidy repository structured precisely by university, course, and semester. Notes are uploaded by top-performing seniors, reviewed by peers, and organized in beautiful digital previews.
                </p>
              </div>
              <ul className="space-y-3 mt-2 border-t border-emerald-100/50 pt-4">
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-accent-green shrink-0 font-bold text-xs mt-0.5">&#10003;</span>
                  <span>Search by subject or unit in under 3 seconds</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-accent-green shrink-0 font-bold text-xs mt-0.5">&#10003;</span>
                  <span>Curriculum-aligned files matching current semesters</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-accent-green shrink-0 font-bold text-xs mt-0.5">&#10003;</span>
                  <span>PDF previews and structured chapters</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white border-y border-border-light py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Built For Excellence</h2>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
                Features that organize your academic life.
              </p>
              <p className="text-sm sm:text-base text-secondary-gray mt-4 max-w-xl mx-auto">
                No complex setups. Just instant access to quality study resources structured for readability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                iconName="GraduationCap"
                title="University-wise Organization"
                description="Browse notes categorized specifically under your university, ensuring alignment with your professors."
              />
              <FeatureCard
                iconName="BookOpen"
                title="Semester-wise Layouts"
                description="Easily filter subjects from Semester 1 to Semester 8 without digging through random folders."
              />
              <FeatureCard
                iconName="Search"
                title="Syllabus Filters"
                description="Search specific topics, modules, or past question papers in a single click."
              />
              <FeatureCard
                iconName="FileText"
                title="In-Browser PDF Preview"
                description="Read notes directly in your browser or mobile phone with our lightning-fast document viewer."
              />
              <FeatureCard
                iconName="Bookmark"
                title="Saved & Bookmarks"
                description="Save essential chapters or quick cheat sheets to your dashboard for quick pre-exam review."
              />
              <FeatureCard
                iconName="ShieldCheck"
                title="Verified Review Process"
                description="Notes are rated and reviewed by students who took the course to maintain elite academic quality."
              />
              <FeatureCard
                iconName="Users"
                title="Fast Search"
                description="Type keywords to instantly locate pages, chapters, or syllabus breakdowns."
              />
              <FeatureCard
                iconName="Award"
                title="Previous Year Papers"
                description="Get matched university exams from prior terms accompanied by student solutions."
              />
            </div>

            <div className="text-center mt-12">
              <Link href="/features">
                <Button variant="outline" className="group">
                  View Full Product Roadmap
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Workflow</h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
              Three steps to academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-4 relative">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground">Select University</h3>
              <p className="text-sm text-secondary-gray leading-relaxed max-w-xs">
                Pick your college and your major (e.g., Computer Science, Business, BioTech) to fetch your standard syllabus structure.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-4 relative">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground">Filter by Semester</h3>
              <p className="text-sm text-secondary-gray leading-relaxed max-w-xs">
                Select your current semester. Instantly view matching subject folders containing lectures, revision guides, and notes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-4 relative">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground">Study & Excel</h3>
              <p className="text-sm text-secondary-gray leading-relaxed max-w-xs">
                Preview notes seamlessly on mobile or desktop, bookmark crucial sections, and study with verified academic files.
              </p>
            </div>
          </div>
        </section>

        {/* Subjects & Universities Section */}
        <section className="bg-white border-y border-border-light py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5">
                <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Expansive Coverage</h2>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
                  Universities & courses we support.
                </p>
                <p className="text-sm sm:text-base text-secondary-gray mt-4 leading-relaxed">
                  We are expanding our network of contributors. Initially launching support for major engineering, science, and commerce curricula across major institutions.
                </p>
                <div className="mt-8">
                  <Link href="/contact">
                    <Button variant="outline" className="group">
                      Request Your University
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* University list */}
                <div className="p-6 border border-border-light rounded-2xl bg-background">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Target Universities
                  </h3>
                  <ul className="space-y-3">
                    {UNIVERSITIES.map((uni, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm border-b border-border-light/50 last:border-b-0 pb-2 last:pb-0">
                        <span className="font-medium text-foreground">{uni.name}</span>
                        <span className="text-xs text-secondary-gray bg-gray-100 px-2 py-0.5 rounded-full">{uni.location}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Popular courses */}
                <div className="p-6 border border-border-light rounded-2xl bg-background">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Popular Subjects
                  </h3>
                  <ul className="space-y-3">
                    {POPULAR_SUBJECTS.slice(0, 6).map((sub, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-secondary-gray border-b border-border-light/50 last:border-b-0 pb-2.5 last:pb-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-green shrink-0" />
                        <span className="truncate">{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Benefits</h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
              Study smarter, not longer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Professor Aligned</h3>
              <p className="text-sm text-secondary-gray mt-2 leading-relaxed">
                Our note structures follow the standard syllabus closely, ensuring you study topics relevant for your specific tests.
              </p>
            </div>

            <div className="p-6 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Save Hours of Search</h3>
              <p className="text-sm text-secondary-gray mt-2 leading-relaxed">
                Stop begging friends for missed lectures. Get high-quality scans or digital summaries from students who already scored A+.
              </p>
            </div>

            <div className="p-6 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Exam Optimized</h3>
              <p className="text-sm text-secondary-gray mt-2 leading-relaxed">
                Access curated formula sheets, quick definitions, and key previous year questions to streamline your final review.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials (Student quotes placeholder) */}
        <section className="bg-white border-y border-border-light py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Student Voice</h2>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
                Loved by college students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-6 border border-border-light rounded-xl bg-background flex flex-col justify-between gap-4">
                <p className="text-sm text-secondary-gray leading-relaxed italic">
                  &quot;Before finals, our WhatsApp group is filled with 100+ PDF links, half of which are duplicate or outdated. An organized portal sorted by subject and unit is exactly what we need.&quot;
                </p>
                <div>
                  <p className="font-bold text-sm text-foreground">Aarav Mehta</p>
                  <p className="text-xs text-secondary-gray">Computer Science, Delhi University</p>
                </div>
              </div>

              <div className="p-6 border border-border-light rounded-xl bg-background flex flex-col justify-between gap-4">
                <p className="text-sm text-secondary-gray leading-relaxed italic">
                  &quot;Getting formula sheets and previous year solved questions in one tab changes everything. No more scanning through shady websites with pop-up ads.&quot;
                </p>
                <div>
                  <p className="font-bold text-sm text-foreground">Priya Sharma</p>
                  <p className="text-xs text-secondary-gray">Electronics Engineering, VTU</p>
                </div>
              </div>

              <div className="p-6 border border-border-light rounded-xl bg-background flex flex-col justify-between gap-4">
                <p className="text-sm text-secondary-gray leading-relaxed italic">
                  &quot;I took detailed iPad notes for Calculus. Having a clean place to share them where my juniors can actually find them semester-by-semester is awesome.&quot;
                </p>
                <div>
                  <p className="font-bold text-sm text-foreground">Rohan Das</p>
                  <p className="text-xs text-secondary-gray">Mathematics Major, Mumbai University</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 sm:py-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" id="faq">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Got Questions?</h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
              Frequently Asked Questions
            </p>
          </div>
          <Accordion items={FAQ_ITEMS} />
        </section>

        {/* Final CTA Waitlist Drive */}
        <section className="bg-primary text-white py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <div className="h-[300px] w-[500px] rounded-full bg-white blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Ready to study smarter?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-xl mx-auto">
              Join the Campusiyo waitlist today. Get notified as soon as beta study guides and notes for your courses go live.
            </p>
            <div className="mt-8 max-w-md mx-auto">
              <Link href="#waitlist">
                <Button variant="accent" size="lg">
                  Join Campusiyo Waitlist
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
