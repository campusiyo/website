"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Search, ArrowRight, BookMarked, Eye, ChevronDown, ChevronUp, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Note {
  id: string;
  title: string;
  description: string;
  subjectName?: string;
  subject?: string;
  viewCount: number;
}

interface SubjectInfo {
  name: string;
  code: string;
  courseId?: string;
  courseName?: string;
  notes: Note[];
  isOpen?: boolean; // For expanding notes in-place
}

// Static metadata fallback for codes
const SUBJECT_METADATA: Record<string, string> = {
  "data structures": "CS-301",
  "macroeconomics": "EC-202",
  "organic chemistry": "CH-103",
  "calculus & algebra": "MA-101",
  "operating systems": "CS-302",
  "corporate finance": "FI-401",
  "signal processing": "EE-304",
  "general psychology": "PY-101",
  "computer networks": "CS-303"
};

export default function SubjectsPage() {
  const router = useRouter();
  const { user, loading, initialized } = useAuth();

  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Enforce login for accessing subjects page
  useEffect(() => {
    if (initialized && !loading && !user) {
      setShowLoginModal(true);
    }
  }, [initialized, loading, user]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load search parameter from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("search");
      if (q) {
        setSearchQuery(q);
      }
    }
  }, []);

  // Fetch all notes to aggregate subjects
  useEffect(() => {
    if (initialized) {
      const fetchAndAggregate = async () => {
        try {
          // 1. Fetch all courses to map IDs to names
          const courseRes = await api.get("/courses");
          const courseData = courseRes.ok ? await courseRes.json() : [];
          setCourses(courseData);

          const courseNameMap: Record<string, string> = {};
          courseData.forEach((c: any) => {
            if (c.id && c.name) {
              courseNameMap[c.id.toLowerCase()] = c.name;
            }
          });

          // 2. Fetch registered subjects to map names to official subjectCodes and courseIds
          const subjectsRes = await api.get("/notes/subjects");
          const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
          const codeMap: Record<string, string> = {};
          const subjectCourseIdMap: Record<string, string> = {};

          subjectsData.forEach((s: any) => {
            if (s.name) {
              if (s.subjectCode) {
                codeMap[s.name.toLowerCase()] = s.subjectCode;
              }
              if (s.courseId) {
                subjectCourseIdMap[s.name.toLowerCase()] = s.courseId;
              }
            }
          });

          // 3. Fetch notes
          const res = await api.get("/notes");
          if (res.ok) {
            const data: Note[] = await res.json();
            
            // Map to aggregate unique subjects with their respective notes
            const subjectMap: Record<string, Note[]> = {};
            data.forEach((note) => {
              const subName = note.subjectName || note.subject || "General Study Guide";
              if (!subjectMap[subName]) {
                subjectMap[subName] = [];
              }
              subjectMap[subName].push(note);
            });

            // Read search param to auto-expand
            const searchParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("search")?.toLowerCase() : "";

            // Format into list
            const list: SubjectInfo[] = Object.keys(subjectMap).map((subName) => {
              const courseId = subjectCourseIdMap[subName.toLowerCase()] || "";
              const courseName = courseId ? (courseNameMap[courseId.toLowerCase()] || "") : "";
              return {
                name: subName,
                code: codeMap[subName.toLowerCase()] || SUBJECT_METADATA[subName.toLowerCase()] || "GEN-101",
                courseId: courseId,
                courseName: courseName,
                notes: subjectMap[subName],
                isOpen: searchParam ? (
                  subName.toLowerCase().includes(searchParam) ||
                  courseName.toLowerCase().includes(searchParam)
                ) : false
              };
            });

            setSubjects(list);
          } else {
            setError("Failed to fetch subjects library.");
          }
        } catch (err) {
          console.log(err)
          setError("Gateway connectivity error.");
        } finally {
          setSubjectsLoading(false);
        }
      };

      fetchAndAggregate();
    }
  }, [user, initialized]);

  // Toggle dropdown expander for a subject
  const toggleSubject = (index: number) => {
    setSubjects((prev) =>
      prev.map((sub, idx) => (idx === index ? { ...sub, isOpen: !sub.isOpen } : sub))
    );
  };

  // Filter subjects by search query
  const filteredSubjects = subjects.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const courseName = sub.courseName || "";
    return (
      sub.name.toLowerCase().includes(q) ||
      sub.code.toLowerCase().includes(q) ||
      courseName.toLowerCase().includes(q)
    );
  });

  const [apiSubjects, setApiSubjects] = useState<SubjectInfo[]>([]);
  const [didYouMean, setDidYouMean] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setApiSubjects([]);
      setDidYouMean(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/notes/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          const subjectsData = data.subjects || [];
          
          const courseNameMap: Record<string, string> = {};
          courses.forEach((c: any) => {
            if (c.id && c.name) {
              courseNameMap[c.id.toLowerCase()] = c.name;
            }
          });

          const list: SubjectInfo[] = subjectsData.map((sub: any) => {
            const courseName = sub.courseId ? (courseNameMap[sub.courseId.toLowerCase()] || "") : "";
            const subNotes = (data.notes || []).filter((note: any) => 
              (note.subjectName && note.subjectName.toLowerCase() === sub.name.toLowerCase()) ||
              (note.subject && note.subject.toLowerCase() === sub.name.toLowerCase())
            );
            return {
              name: sub.name,
              code: sub.subjectCode || "GEN-101",
              courseId: sub.courseId,
              courseName: courseName,
              notes: subNotes,
              isOpen: true
            };
          });

          setApiSubjects(list);
          setDidYouMean(data.didYouMean || false);
        } else {
          setApiSubjects([]);
          setDidYouMean(false);
        }
      } catch (err) {
        console.error("Search API error:", err);
        setApiSubjects([]);
        setDidYouMean(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, courses]);

  const displayedSubjects = isSearching ? apiSubjects : filteredSubjects;

  if (loading || !initialized || (subjectsLoading && subjects.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Loading Subjects Index...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-background sm:py-8 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 sm:space-y-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-light pb-4 sm:pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                <BookMarked className="h-8 w-8 text-primary" />
                Subjects Index Directory
              </h1>
              <p className="text-secondary-gray mt-1">
                Explore course syllabuses and select notes directly by curriculum module.
              </p>
            </div>
            {user?.role === "ADMIN" && (
              <Button
                variant="accent"
                size="sm"
                onClick={() => router.push("/admin/subjects")}
                className="shrink-0 cursor-pointer"
              >
                Manage Subjects Board
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Search bar */}
          <div className="bg-card-bg border border-border-light rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center w-full bg-background border border-border-light rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Search className="h-4 w-4 text-secondary-gray shrink-0 ml-3.5" />
              <input
                type="text"
                placeholder="Search subjects by name or code index..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 pl-2 pr-4 py-2 bg-transparent border-0 rounded-xl text-sm text-foreground placeholder:text-secondary-gray/70 placeholder:truncate outline-none focus:ring-0"
              />
            </div>
          </div>

          {didYouMean && (
            <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/20 text-left flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="h-4 w-4" />
              <span>Showing results for fuzzy search. (No exact match was found).</span>
            </div>
          )}

          {/* Subjects Expansion List */}
          {displayedSubjects.length === 0 ? (
            <div className="text-center py-20 bg-card-bg border border-border-light rounded-2xl p-8 space-y-3">
              <BookOpen className="h-12 w-12 text-secondary-gray/40 mx-auto" />
              <h3 className="font-bold text-lg text-foreground">No Subjects Found</h3>
              <p className="text-secondary-gray text-sm max-w-md mx-auto">
                No subjects index match your filters. Try checking other terms or search parameters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedSubjects.map((sub, index) => (
                <div
                  key={sub.name}
                  className="bg-card-bg border border-border-light rounded-2xl overflow-hidden transition-all duration-200"
                >
                  {/* Row Trigger */}
                  <div
                    onClick={() => toggleSubject(index)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-hover-card-bg transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                        {sub.code}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground text-sm sm:text-base truncate">
                          {sub.name}
                        </h3>
                        {sub.courseName && (
                          <span className="text-[10px] font-semibold text-secondary-gray block mt-0.5 tracking-wide">
                            {sub.courseName}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-secondary-gray font-semibold bg-background border border-border-light px-2.5 py-1 rounded-full">
                        {sub.notes.length} {sub.notes.length === 1 ? "note" : "notes"}
                      </span>
                      {sub.isOpen ? (
                        <ChevronUp className="h-5 w-5 text-secondary-gray" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-secondary-gray" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Notes List */}
                  {sub.isOpen && (
                    <div className="border-t border-border-light bg-gray-50/20 dark:bg-slate-900/10 p-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <h4 className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest px-1">
                        Syllabus Study Materials ({sub.notes.length})
                      </h4>
                      {sub.notes.length === 0 ? (
                        <p className="text-xs text-secondary-gray p-1">No notes files published for this subject yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          {sub.notes.map((note) => (
                            <div
                              key={note.id}
                              className="bg-card-bg border border-border-light hover:border-primary/30 p-4 rounded-xl flex flex-col justify-between hover:bg-hover-card-bg transition-all group"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-center gap-2">
                                  <span className="flex items-center gap-1 text-[9px] text-secondary-gray font-bold">
                                    <Eye className="h-2.5 w-2.5" />
                                    {note.viewCount} views
                                  </span>
                                </div>
                                <h5 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                  {note.title}
                                </h5>
                                <p className="text-[11px] text-secondary-gray line-clamp-2 leading-relaxed">
                                  {note.description || "Lecture study and quick sheet notes."}
                                </p>
                              </div>
                              <div className="mt-4 pt-3 border-t border-border-light/40">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-center group/btn text-[10px] font-bold py-1.5 bg-card-bg border-border-light hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/notes/${note.id}`);
                                  }}
                                >
                                  <span>View PDF Study</span>
                                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
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
                onClick={() => router.push("/")}
                className="flex-1 py-2.5 px-4 rounded-xl bg-card-bg border border-border-light hover:bg-gray-50 dark:hover:bg-slate-800 text-foreground text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
