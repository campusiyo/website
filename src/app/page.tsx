"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Accordion } from "@/components/ui/Accordion";
import Footer from "@/components/Footer";
import Image from "next/image";
import {
  Check,
  X,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Search as SearchIcon,
  FileText,
  Bookmark,
  Users,
  ShieldCheck,
  Award,
  Star,
  ArrowUpRight,
  Code,
  Briefcase,
  FlaskConical,
  Scale,
  Eye,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Compass,
  ArrowRightLeft,
  Smartphone
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import LoginRequiredOverlay from "@/components/LoginRequiredOverlay";
import { subjectService } from "@/services/subjectService";
import { courseService } from "@/services/courseService";
import { noteService } from "@/services/noteService";

// FAQ items for SEO Content
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

const getCourseStyle = (categoryName?: string) => {
  const cat = categoryName?.toLowerCase() || "";
  if (cat.includes("eng") || cat.includes("tech") || cat.includes("computer") || cat.includes("code")) {
    return {
      icon: Code,
      color: "from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400"
    };
  }
  if (cat.includes("bus") || cat.includes("comm") || cat.includes("fin") || cat.includes("man") || cat.includes("admin")) {
    return {
      icon: Briefcase,
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400"
    };
  }
  if (cat.includes("scie") || cat.includes("chem") || cat.includes("phys") || cat.includes("math")) {
    return {
      icon: FlaskConical,
      color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400"
    };
  }
  return {
    icon: GraduationCap,
    color: "from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400"
  };
};

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [didYouMean, setDidYouMean] = useState(false);

  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!user) {
      e.target.blur();
      setShowLoginModal(true);
    }
  };

  const handleSearchClick = () => {
    if (!user) {
      setShowLoginModal(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setSearchQuery(e.target.value);
  };

  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    setWaitlistLoading(true);
    setTimeout(() => {
      setWaitlistLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [popularSubjects, setPopularSubjects] = useState<any[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularSubjects = async () => {
      setIsLoadingSubjects(true);
      setSubjectError(null);
      try {
        const res = await subjectService.popular();
        if (res.ok) {
          const data = await res.json();
          setPopularSubjects(data || []);
        } else {
          setSubjectError("Failed to load popular subjects");
        }
      } catch (err) {
        setSubjectError("Connection failed");
        console.error(err);
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    fetchPopularSubjects();
  }, []);

  useEffect(() => {
    const fetchTopCourses = async () => {
      setIsLoadingCourses(true);
      setCoursesError(null);
      try {
        const res = await courseService.getTop();
        if (res.ok) {
          const data = await res.json();
          setCourses(data || []);
        } else {
          setCoursesError("Failed to fetch top courses");
        }
      } catch (err) {
        setCoursesError("Gateway connection failed");
        console.error(err);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchTopCourses();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      setDidYouMean(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await noteService.search(searchQuery);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.notes || []);
          setDidYouMean(data.didYouMean || false);
        } else {
          setSearchResults([]);
          setDidYouMean(false);
        }
      } catch (err) {
        console.error("Search API error:", err);
        setSearchResults([]);
        setDidYouMean(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Structured Data Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Campusiyo",
    alternateName: "Campusiyo",
    url: "https://campusiyo.in",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Campusiyo",
    url: "https://campusiyo.in",
    logo: "https://campusiyo.in/icon.png",
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* 1. Navbar */}
      <Navbar />

      <main className="flex-grow">
        
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden bg-background flex flex-col items-center justify-center py-10 sm:py-16 sm:h-[50vh] sm:min-h-[400px]">
          {/* Background image under hero with low opacity */}
          <div className="absolute inset-0 -z-10 w-full h-full">
            <Image
              src="/images/campus-aerial.jpg"
              alt="University Campus Background"
              fill
              className="object-cover opacity-15 dark:opacity-[0.08] transition-opacity"
              priority
            />
            {/* Subtle overlay gradients for contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6 w-full">
            {/* Tagline */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold border border-primary/10 tracking-wide">
              <span>Classroom Notes Sorted Semester-Wise</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Find Organized Notes for Your <span className="text-primary relative inline-block">University.
                <span className="absolute left-0 bottom-1 w-full h-1 bg-accent-green/30 rounded-full -z-10" />
              </span>
            </h1>

            {/* Subtitle / Centered Notes Bar */}
            <div className="relative max-w-xl mx-auto pt-1 sm:pt-2 w-full">
              <div className="relative flex items-center shadow-sm rounded-lg bg-card-bg border border-border-light focus-within:border-primary transition-all">
                <SearchIcon className="ml-4 h-4 w-4 shrink-0 text-secondary-gray/80 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search 10+ subject notes and pyq's..."
                  value={searchQuery}
                  onFocus={handleSearchFocus}
                  onClick={handleSearchClick}
                  onChange={handleSearchChange}
                  className="w-full h-10 pl-3 pr-12 bg-transparent border-0 rounded-lg text-sm text-foreground placeholder:text-foreground/45 outline-none focus:ring-0 cursor-pointer"
                  suppressHydrationWarning
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-secondary-gray hover:text-foreground px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Direct Android APK Download Button */}
            <div className="pt-1 sm:pt-2 flex justify-center">
              <a
                href="/Campusiyo.apk"
                download="Campusiyo.apk"
                className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card-bg/90 border border-border-light hover:border-primary/40 text-xs font-semibold text-foreground hover:text-primary shadow-xs transition-all cursor-pointer group max-w-full text-center"
              >
                <Smartphone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform shrink-0" />
                <span>Campusiyo Android App (.APK)</span>
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0">Target SDK 35</span>
              </a>
            </div>
          </div>
        </section>

        {/* 3. Search Notes (Live query results panel or browse directory suggestion cards) */}
        <section className="py-0 bg-card-bg dark:bg-background border-b border-border-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {isSearching ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border-light pb-3">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                    <SearchIcon className="h-4 w-4 text-primary" />
                    <span>Search Results ({searchResults.length})</span>
                  </h3>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-secondary-gray hover:text-foreground font-semibold cursor-pointer"
                  >
                    Reset Query
                  </button>
                </div>

                {didYouMean && (
                  <div className="mb-4 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/20 text-left flex items-center gap-1.5 animate-pulse">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Showing results for fuzzy search. (No exact match was found).</span>
                  </div>
                )}

                {searchResults.length === 0 ? (
                  <div className="text-center py-10 bg-background border border-border-light rounded-2xl p-6 space-y-2">
                    <AlertCircle className="h-10 w-10 text-secondary-gray/45 mx-auto" />
                    <p className="font-bold text-foreground">No matches found</p>
                    <p className="text-xs text-secondary-gray">We are actively expanding notes coverage. Join our waitlist to request this course!</p>
                  </div>
                ) : (
                  <div className="max-h-[360px] overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                    <div className="grid grid-cols-1 gap-3 pb-2">
                      {searchResults.map((note) => (
                        <Link
                          key={note.id}
                          href={`/notes/${note.id}`}
                          className="bg-background border border-border-light hover:border-primary/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all group cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-0.5 rounded bg-primary/5 text-primary font-bold uppercase">
                                {note.subjectName || note.subject || "General"}
                              </span>
                              <span className="text-secondary-gray flex items-center gap-1 font-semibold">
                                <Eye className="h-3 w-3" />
                                {note.viewCount || 0}
                              </span>
                            </div>
                            <p className="font-bold text-foreground mt-1 group-hover:text-primary transition-colors text-sm sm:text-base">
                              {note.title}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-primary flex items-center gap-1 shrink-0 self-end sm:self-center">
                            <span>Read PDF Document</span>
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : courses.length > 0 ? (
              <div className="text-center space-y-3 pt-0 pb-5">
                <p className="text-sm font-semibold text-secondary-gray uppercase tracking-wider">
                  Quick Access Courses
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {courses.slice(0, 5).map((course) => (
                    <button
                      key={course.id}
                      onClick={() => router.push(`/courses?courseId=${course.id}`)}
                      className="px-4 py-2 bg-background border border-border-light hover:border-primary/45 rounded-lg text-xs font-bold text-foreground/80 hover:text-primary transition-all cursor-pointer shadow-sm"
                    >
                      {course.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* 4. Popular Subjects */}
        {(!isLoadingSubjects && popularSubjects.length === 0) ? null : (
          <section className="py-8 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
              <div className="space-y-2 max-w-xl mx-auto">
                <h2 className="text-base font-bold text-primary uppercase tracking-widest">Academic Core</h2>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  Popular Subjects & PYQ's
                </p>
                <p className="text-sm text-secondary-gray">
                  Direct curriculum chapters mapping college assessment schedules.
                </p>
              </div>

              {isLoadingSubjects ? (
                /* Loading Skeleton Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-card-bg border border-border-light rounded-2xl p-5 h-44 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="h-4 w-16 bg-border-light/20 dark:bg-slate-800 rounded-md" />
                        <div className="h-6 w-3/4 bg-border-light/20 dark:bg-slate-800 rounded-md" />
                        <div className="h-3.5 w-5/6 bg-border-light/20 dark:bg-slate-800 rounded-md" />
                      </div>
                      <div className="h-4 w-24 bg-border-light/20 dark:bg-slate-800 rounded-md mt-4" />
                    </div>
                  ))}
                </div>
              ) : (
                /* Dynamic Subjects Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                  {popularSubjects.slice(0, 6).map((sub) => (
                    <Link
                      key={sub.id}
                      href="/subjects"
                      className="bg-card-bg border border-border-light rounded-2xl p-5 text-left flex flex-col justify-between hover:bg-hover-card-bg hover:border-primary/40 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-md">
                          {sub.subjectCode || "GEN-101"}
                        </span>
                        <h3 className="font-bold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors pt-2">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-secondary-gray mt-1 leading-normal line-clamp-2">{sub.description || "Course study modules and exam sheets."}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-primary font-bold pt-4 border-t border-gray-50 dark:border-slate-800 mt-4">
                        <span>Browse Notes</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. Courses We Support */}
        {(!isLoadingCourses && courses.length === 0) ? null : (
          <section className="sm:py-16 py-8 bg-card-bg dark:bg-background border-y border-border-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
              <div className="space-y-2 max-w-xl mx-auto">
                <h2 className="text-base font-bold text-primary uppercase tracking-widest">Browse by Catalog</h2>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  Courses We Support
                </p>
                <p className="text-sm text-secondary-gray">
                  Explore study materials organized by academic programs available on Campusiyo.
                </p>
              </div>

              {isLoadingCourses ? (
                /* Loading Skeleton Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col bg-background dark:bg-card-bg border border-border-light p-6 rounded-2xl h-[260px] justify-between">
                      <div className="space-y-4">
                        <div className="h-12 w-12 rounded-xl bg-border-light/20 dark:bg-slate-800" />
                        <div className="h-4 w-20 bg-border-light/20 dark:bg-slate-800 rounded-md" />
                        <div className="h-6 w-3/4 bg-border-light/20 dark:bg-slate-800 rounded-md" />
                        <div className="h-3.5 w-5/6 bg-border-light/20 dark:bg-slate-800 rounded-md" />
                      </div>
                      <div className="h-4 w-24 bg-border-light/20 dark:bg-slate-800 rounded-md mt-6" />
                    </div>
                  ))}
                </div>
              ) : (
                /* Dynamic Courses Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {courses.map((course) => {
                    const style = getCourseStyle(course.categoryName);
                    const IconComponent = style.icon;
                    return (
                      <Link
                        key={course.id}
                        href={`/courses?courseId=${course.id}`}
                        className="flex flex-col bg-background dark:bg-card-bg border border-border-light hover:border-primary/30 p-6 rounded-2xl text-left hover:bg-hover-card-bg dark:hover:bg-hover-card-bg hover:shadow-sm transition-all duration-200 group cursor-pointer"
                      >
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center shrink-0 border border-current/10 mb-4`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-extrabold text-primary/85 uppercase tracking-wider block mb-1">
                          {course.categoryName || "Academic Program"}
                        </span>
                        <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">
                          {course.name}
                        </h3>
                        <p className="text-xs text-secondary-gray mt-2 leading-relaxed flex-grow line-clamp-2">
                          {course.description || "Course syllabus modules and semester notes catalog."}
                        </p>
                        
                        {/* Optional Metadata */}
                        <div className="flex items-center gap-3.5 mt-4 pt-3.5 border-t border-border-light text-[10px] text-secondary-gray font-bold select-none">
                          {course.totalSemesters && (
                            <span>{course.totalSemesters} Semesters</span>
                          )}
                          {course.subjectCount > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="h-1 w-1 rounded-full bg-secondary-gray" />
                              <span>{course.subjectCount} Subjects</span>
                            </div>
                          )}
                        </div>

                        <span className="text-xs text-primary font-bold mt-6 inline-flex items-center gap-1">
                          <span>Browse Subjects</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 6. Featured Notes */}
        <section className="sm:py-16 py-8 bg-background border-y border-border-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-base font-bold text-primary uppercase tracking-widest">Featured Guides</h2>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                Top Rated Study Materials
              </p>
              <p className="text-sm text-secondary-gray">
                Scanned lectures and cheat sheets highly reviewed by scoring seniors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: "Data Structures - Linked Lists & Stacks (Unit 1)",
                  subject: "Computer Science",
                  desc: "Singly and doubly lists operations, stack implementation, stack applications (Infix to Postfix).",
                  views: "1,540",
                  rating: 4.9,
                  uni: "Delhi University"
                },
                {
                  title: "Macroeconomics - Keynesian Shifts & IS-LM Model",
                  subject: "Economics",
                  desc: "Formula breakdowns, graphical representation of shocks, equilibrium derivation and numerical answers.",
                  views: "980",
                  rating: 4.8,
                  uni: "Mumbai University"
                },
                {
                  title: "Organic Chemistry - Alkene Synthesis Reactions",
                  subject: "Chemistry",
                  desc: "Full handwritten mechanisms summaries, reagent categories, hydration and hydroboration guides.",
                  views: "2,110",
                  rating: 4.9,
                  uni: "VTU Karnataka"
                }
              ].map((note, idx) => (
                <div
                  key={idx}
                  className="bg-card-bg border border-border-light rounded-2xl p-6 text-left flex flex-col justify-between hover:bg-hover-card-bg hover:shadow-sm transition-all duration-200 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary uppercase">
                        {note.subject}
                      </span>
                      <span className="text-secondary-gray font-medium">{note.uni}</span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-bold text-foreground text-base sm:text-lg line-clamp-1">
                        {note.title}
                      </h3>
                      <p className="text-sm text-secondary-gray line-clamp-2 leading-relaxed">
                        {note.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex gap-4 text-xs font-semibold text-secondary-gray">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {note.views} views
                      </span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {note.rating}
                      </span>
                    </div>
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="py-1 px-3 text-xs font-semibold cursor-pointer">
                        Read PDF
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Why Campusiyo? */}
        <section className="sm:py-20 py-8 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-20">
            <h2 className="text-base font-bold text-primary uppercase tracking-widest">Why Campusiyo?</h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
              Why traditional exam prep is broken.
            </p>
            <p className="text-sm sm:text-base text-secondary-gray mt-4 max-w-xl mx-auto">
              Every college student knows the anxiety of final exam week. The struggle isn&apos;t just studying—it&apos;s finding what to study.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-5xl mx-auto">
            {/* The Problem */}
            <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/40 rounded-2xl p-8 flex flex-col gap-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-655 dark:text-red-400 border border-red-200 dark:border-red-900/35">
                <X className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Before Campusiyo</h3>
                <p className="text-sm text-secondary-gray mt-2 leading-relaxed">
                  Scrambling through bloated Google Drives, searching WhatsApp chats for PDF links, sorting through handwritten notes with missing pages, and studying outdated resources that don&apos;t match this semester&apos;s syllabus.
                </p>
              </div>
              <ul className="space-y-3 mt-2 border-t border-red-100/50 dark:border-red-950/30 pt-4">
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 font-bold text-xs mt-0.5">&minus;</span>
                  <span>Hours wasted searching instead of studying</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 font-bold text-xs mt-0.5">&minus;</span>
                  <span>Unreliable materials from unverified sources</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 font-bold text-xs mt-0.5">&minus;</span>
                  <span>Syllabus mismatches causing exam surprises</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/35 rounded-2xl p-8 flex flex-col gap-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-accent-green border border-emerald-200 dark:border-emerald-900/35">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">With Campusiyo</h3>
                <p className="text-sm text-secondary-gray mt-2 leading-relaxed">
                  A centralized, tidy repository structured precisely by university, course, and semester. Notes are uploaded by top-performing seniors, reviewed by peers, and organized in beautiful digital previews.
                </p>
              </div>
              <ul className="space-y-3 mt-2 border-t border-emerald-100/50 dark:border-emerald-950/30 pt-4">
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-accent-green shrink-0 font-bold text-xs mt-0.5">&#10003;</span>
                  <span>Search by subject or unit in under 3 seconds</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-accent-green shrink-0 font-bold text-xs mt-0.5">&#10003;</span>
                  <span>Curriculum-aligned files matching current semesters</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-secondary-gray">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-accent-green shrink-0 font-bold text-xs mt-0.5">&#10003;</span>
                  <span>PDF previews and structured chapters</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 8. How It Works */}
        <section className="sm:py-20 py-8 sm:py-28 bg-card-bg dark:bg-background border-y border-border-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 mb-16">
              <h2 className="text-base font-bold text-primary uppercase tracking-widest">Workflow</h2>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
                Three steps to academic success.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center gap-4 relative">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm border border-primary/20">
                  1
                </div>
                <h3 className="text-lg font-bold text-foreground">Select Course</h3>
                <p className="text-sm text-secondary-gray leading-relaxed max-w-xs">
                  Choose your course (e.g., B.Tech, BCA, B.Sc, BA) to access the correct syllabus structure and academic resources.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center gap-4 relative">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm border border-primary/20">
                  2
                </div>
                <h3 className="text-lg font-bold text-foreground">Filter by Semester</h3>
                <p className="text-sm text-secondary-gray leading-relaxed max-w-xs">
                  Select your current semester. Instantly view matching subject folders containing lectures, revision guides, and notes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center gap-4 relative">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm border border-primary/20">
                  3
                </div>
                <h3 className="text-lg font-bold text-foreground">Study & Excel</h3>
                <p className="text-sm text-secondary-gray leading-relaxed max-w-xs">
                  Preview notes seamlessly on mobile or desktop, bookmark crucial sections, and study with verified academic files.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Student Reviews (Photo with written review + 5 stars) */}
        <section className="mb:py-20 py-8 sm:py-28 bg-background border-b border-border-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
              <h2 className="text-base font-bold text-primary uppercase tracking-widest">Student Voice</h2>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
                Loved by college students.
              </p>
              <p className="text-sm text-secondary-gray mt-2">
                Real feedback from university students who aced their semesters using Campusiyo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  quote: "Finding well-organized notes for BA Program subjects usually takes a lot of searching. Having everything arranged semester-wise in one place makes studying much simpler, especially during exams.",
                  name: "Ashish Somvanshi",
                  course: "BA Program, Motilal Nehru College",
                  avatar: "/images/ashish.jpeg"
                },
                {
                  quote: "Campusiyo makes it easy to find reliable notes without jumping between multiple websites and WhatsApp groups. The clean organization by semester and subject saves a lot of time.",
                  name: "Subrat Rathour",
                  course: "BA Program, Sri Venkateswara College",
                  avatar: "/images/subrat.jpeg"
                },
                {
                  quote: "The structured course and semester navigation makes finding study material effortless. Instead of wasting time searching across different sources, I can quickly access the notes I actually need.",
                  name: "Priydev Mishra",
                  course: "B.Tech, AKTU Lucknow",
                  avatar: "/images/priydev.jpg"
                }
              ].map((rev, idx) => (
                <div
                  key={idx}
                  className="bg-card-bg border border-border-light rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6 hover:bg-hover-card-bg hover:shadow-sm transition-all duration-200 relative"
                >
                  <div className="space-y-4">
                    {/* 5 Stars display */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-secondary-gray leading-relaxed italic">
                      &quot;{rev.quote}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 pt-4 border-t border-gray-50 dark:border-slate-800">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="h-10 w-10 rounded-full object-cover border border-border-light shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{rev.name}</p>
                      <p className="text-xs text-secondary-gray truncate">{rev.course}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Our Community / Follow Us */}
        <section className="sm:py-16 py-8 bg-card-bg dark:bg-background border-b border-border-light">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
              <div className="space-y-2">
                <h2 className="text-base font-bold uppercase tracking-widest text-primary">
                  Join the Network
                </h2>

                <p className="text-3xl font-bold tracking-tight text-foreground">
                  Our Community & Socials
                </p>

                <p className="text-sm text-secondary-gray max-w-md mx-auto">
                  Connect with content managers, peer reviewers, and thousands of
                  students preparing for university finals.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto">

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/campusiyo/about/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background dark:bg-card-bg border border-border-light hover:border-[#0A66C2]/40 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:bg-hover-card-bg hover:shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center shrink-0">
                      <svg
                        className="h-5 w-5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 010 4.124zM7.114 20.452H3.559V9h3.555v11.452z" />
                      </svg>
                    </div>

                    <div className="text-left">
                      <p className="font-bold text-foreground text-sm">LinkedIn</p>
                      <p className="text-xs text-secondary-gray">Campusiyo</p>
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-secondary-gray group-hover:text-[#0A66C2] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/campusiyo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background dark:bg-card-bg border border-border-light hover:border-[#E1306C]/40 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:bg-hover-card-bg hover:shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#E1306C]/10 text-[#E1306C] flex items-center justify-center shrink-0">
                      <svg
                        className="h-5 w-5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </div>

                    <div className="text-left">
                      <p className="font-bold text-foreground text-sm">Instagram</p>
                      <p className="text-xs text-secondary-gray">@campusiyo</p>
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-secondary-gray group-hover:text-[#E1306C] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/campusiyo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background dark:bg-card-bg border border-border-light hover:border-[#1877F2]/40 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:bg-hover-card-bg hover:shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0">
                      <svg
                        className="h-5 w-5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z" />
                      </svg>
                    </div>

                    <div className="text-left">
                      <p className="font-bold text-foreground text-sm">Facebook</p>
                      <p className="text-xs text-secondary-gray">Campusiyo</p>
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-secondary-gray group-hover:text-[#1877F2] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </a>

              </div>
            </div>
          </section>

        {/* 11. Statistics */}
        <section className="dark:bg-background border-b border-border-light text-white sm:py-16 py-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <div className="h-[400px] w-[600px] rounded-full bg-card-bg blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-12">
            <div className="space-y-3 max-w-xl mx-auto mb-0">
              <h2 className="text-sm font-bold text-primary bg-primary/5 border border-primary/10 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                Current Statistics
              </h2>
              <p className="text-3xl text-foreground font-extrabold tracking-tight">
                Empowering college classrooms
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-3 divide-y sm:divide-y-0 sm:divide-x divide-foreground/10">
              <div className="pt-3 sm:pt-0 pb-3">
                <p className="text-4xl sm:text-5xl font-extrabold text-primary">2+</p>
                <p className="text-sm font-medium text-foreground mt-2">Target Universities Indexed</p>
              </div>
              <div className="pt-3 sm:pt-0 pb-3">
                <p className="text-4xl sm:text-5xl font-extrabold text-primary">10+</p>
                <p className="text-sm font-medium text-foreground mt-2">Syllabus Subject Courses</p>
              </div>
              <div className="pt-3 sm:pt-0 pb-3">
                <p className="text-4xl sm:text-5xl font-extrabold text-primary">15,820+</p>
                <p className="text-sm font-medium text-foreground mt-2">Verified PDF Document Views</p>
              </div>
            </div>
          </div>
        </section>

        {/* 12. Call To Action (removed section it was unnecessary) */}

        {/* 13. SEO Content */}
        <section className="sm:py-20 py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16" id="faq">
          
          {/* Detailed keyword rich text for crawler indexing */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-border-light pb-8 sm:pb-16 mb-8">
            <div className="md:col-span-5 space-y-3">
              <h2 className="text-base font-bold text-primary uppercase tracking-widest">Syllabus-Aligned Learning</h2>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                How Campusiyo transforms academic resource indexing
              </h3>
            </div>
            
            <div className="md:col-span-7 space-y-5 text-sm text-secondary-gray leading-relaxed">
              <p>
                In standard higher education curricula, students spend up to 20% of their study time compiling scattered syllabus references, past test questionnaires, and scan copies of slides from different shared links. This unorganized dispersion causes cognitive load and decreases revision efficiency prior to final examinations.
              </p>
              <p>
                <strong>Campusiyo </strong> is designed as a centralized catalog structure. Our index links resources exactly to university blueprints, classifying entries from Semester 1 to Semester 8. This guarantees that whether you study Computer Science algorithms, Macroeconomics modeling, or Organic Chemistry mechanisms, you receive materials matching your course professor&apos;s guidelines.
              </p>
              <p>
                Each published document goes through peer-review queues where content managers evaluate readability, completeness, and alignment with course templates before approval. This verification ensures that only accurate, high-quality, and premium lecture guides are visible to students.
              </p>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="space-y-12">
            <div className="text-center mb-8">
              <h2 className="text-base font-bold text-primary uppercase tracking-widest">Got Questions?</h2>
              <p className="text-3xl font-bold tracking-tight text-foreground mt-2">
                Frequently Asked Questions
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Accordion items={FAQ_ITEMS} />
            </div>
          </div>
          
        </section>
      </main>

      {/* 14. Footer */}
      <Footer />

      {showLoginModal && (
        <LoginRequiredOverlay onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}
