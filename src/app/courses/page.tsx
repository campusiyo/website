"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, BookOpen, Eye, ArrowRight, Library, GraduationCap, ChevronRight, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Note {
  id: string;
  title: string;
  description: string;
  subjectName?: string;
  subject?: string;
  viewCount: number;
}

// Static course definitions with semesters mapping to subject names
const AVAILABLE_COURSES = [
  {
    id: "cse",
    name: "B.Tech Computer Science & Engineering",
    code: "B.Tech CSE",
    icon: "💻",
    subjectsBySemester: {
      1: ["Calculus & Algebra"],
      2: [],
      3: ["Data Structures"],
      4: ["Operating Systems", "Signal Processing"],
      5: ["Computer Networks"],
      6: [],
      7: [],
      8: []
    }
  },
  {
    id: "bcom",
    name: "Bachelor of Commerce",
    code: "B.Com",
    icon: "📈",
    subjectsBySemester: {
      1: [],
      2: ["Macroeconomics"],
      3: [],
      4: ["Corporate Finance"],
      5: [],
      6: [],
      7: [],
      8: []
    }
  },
  {
    id: "bsc",
    name: "Bachelor of Science",
    code: "B.Sc Sciences",
    icon: "🔬",
    subjectsBySemester: {
      1: ["Organic Chemistry", "Calculus & Algebra"],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: []
    }
  },
  {
    id: "bba",
    name: "Bachelor of Business Administration",
    code: "BBA",
    icon: "💼",
    subjectsBySemester: {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: []
    }
  },
  {
    id: "ba",
    name: "Bachelor of Arts",
    code: "B.A. Humanities",
    icon: "🎨",
    subjectsBySemester: {
      1: ["General Psychology"],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: []
    }
  }
];

const getCourseEmoji = (categoryName?: string) => {
  const cat = categoryName?.toLowerCase() || "";
  if (cat.includes("eng") || cat.includes("tech") || cat.includes("computer")) return "💻";
  if (cat.includes("bus") || cat.includes("comm") || cat.includes("fin") || cat.includes("man")) return "📈";
  if (cat.includes("scie") || cat.includes("chem") || cat.includes("phys")) return "🔬";
  if (cat.includes("art") || cat.includes("hum")) return "🎨";
  return "🎓";
};

export default function CoursesPage() {
  const router = useRouter();
  const { user, loading, initialized } = useAuth();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeSubjects, setActiveSubjects] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch all published notes, courses, and subjects dynamically
  useEffect(() => {
    if (initialized) {
      const fetchData = async () => {
        try {
          // 1. Fetch courses
          const courseRes = await api.get("/courses");
          const courseData = courseRes.ok ? await courseRes.json() : [];
          setCourses(courseData);

          // 2. Fetch subjects list to map codes
          const subjectsRes = await api.get("/notes/subjects");
          const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
          setSubjects(subjectsData);

          // 3. Fetch notes
          const notesRes = await api.get("/notes");
          if (notesRes.ok) {
            const notesData = await notesRes.json();
            setNotes(notesData);
          } else {
            setError("Failed to fetch study notes catalog.");
          }

          // Set default selected course — always open to Semester 1
          if (courseData.length > 0) {
            const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
            const queryCourseId = params ? params.get("courseId") : null;
            
            if (queryCourseId) {
              const matched = courseData.find(
                (c: any) => c.id === queryCourseId || c.name.toLowerCase() === queryCourseId.toLowerCase()
              );
              if (matched) {
                setSelectedCourse(matched);
                setSelectedSemester(1); // always start at Semester 1
                setNotesLoading(false);
                setCoursesLoading(false);
                return;
              }
            }

            if (user?.course) {
              const matched = courseData.find(
                (c: any) => c.name.toLowerCase() === user.course?.toLowerCase()
              );
              setSelectedCourse(matched || courseData[0]);
            } else {
              setSelectedCourse(courseData[0]);
            }
            // Semester always starts at 1 regardless of which course was auto-selected
            setSelectedSemester(1);
          }

        } catch (err) {
          console.error("[Courses] Fetch error:", err);
          setError("Gateway connectivity error.");
        } finally {
          setNotesLoading(false);
          setCoursesLoading(false);
        }
      };

      fetchData();
    }
  }, [user, initialized]);

  // Fetch subjects dynamically by selected course and semester
  useEffect(() => {
  if (selectedCourse && selectedSemester) {
    const fetchSubjectsForCourseAndSem = async () => {
      try {
        const res = await api.get(
          `/notes/subjects/subjects?courseId=${selectedCourse.id}&semester=${selectedSemester}`
        );

        if (res.ok) {
          const data = await res.json();
          setActiveSubjects(data || []);
        } else {
          setActiveSubjects([]);
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setActiveSubjects([]);
      }
    };

    fetchSubjectsForCourseAndSem();
  } else {
    setActiveSubjects([]);
  }
}, [selectedCourse, selectedSemester]);

  // Enforce login for accessing courses page
  useEffect(() => {
    if (initialized && !loading && !user) {
      setShowLoginModal(true);
    }
  }, [initialized, loading, user]);

  // Semester always starts at 1 when a course is first selected.
  // The course tab onClick already calls setSelectedSemester(1) on manual switches.
  // No useEffect needed here — default state handles the initial case.

  // Get active subjects for the current selected course & semester dynamically (with local fallback if API returns empty)
  const activeSemesterSubjects = activeSubjects.length > 0
    ? activeSubjects.map((sub: any) => sub.name)
    : selectedCourse
      ? subjects
          .filter((sub) => {
            const subCourse = (sub.course || "").toLowerCase();
            const selectedName = (selectedCourse.name || "").toLowerCase();
            return (
              sub.courseId === selectedCourse.id ||
              subCourse === selectedName ||
              subCourse === (selectedCourse.id || "").toLowerCase()
            ) && sub.semester === selectedSemester;
          })
          .map((sub) => sub.name)
      : [];

  const [apiNotes, setApiNotes] = useState<any[]>([]);
  const [didYouMean, setDidYouMean] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setApiNotes([]);
      setDidYouMean(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/notes/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setApiNotes(data.notes || []);
          setDidYouMean(data.didYouMean || false);
        } else {
          setApiNotes([]);
          setDidYouMean(false);
        }
      } catch (err) {
        console.error("Search API error:", err);
        setApiNotes([]);
        setDidYouMean(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Filter notes that belong to the current course + semester subjects
  const notesSource = isSearching ? apiNotes : notes;

  const filteredNotes = notesSource.filter((note) => {
    const subName = (note.subjectName || note.subject || "").toLowerCase();
    
    // Check if the note belongs to the selected course-semester subjects list
    const matchesSemesterSubject = activeSemesterSubjects.some(
      (sub) => sub.toLowerCase() === subName
    );

    return matchesSemesterSubject;
  });

  if (loading || !initialized || notesLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Loading Courses Catalog...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-background py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:space-y-8 space-y-4">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-light sm:pb-6 pb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                <Library className="h-8 w-8 text-primary" />
                Explore Courses Directory
              </h1>
              <p className="text-secondary-gray mt-1">
                Browse peer-reviewed study files categorized by degrees and semester terms.
              </p>
            </div>
            {user?.role === "ADMIN" && (
              <Button
                variant="accent"
                size="sm"
                onClick={() => router.push("/admin/upload")}
                className="shrink-0 cursor-pointer"
              >
                Upload Note
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Courses Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              return (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setSelectedSemester(1); // Reset semester choice on course swap
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-28 cursor-pointer w-full ${
                    isSelected
                      ? "border-primary bg-primary/[0.03] text-primary shadow-sm"
                      : "border-border-light bg-card-bg text-secondary-gray hover:bg-hover-card-bg"
                  }`}
                >
                  <span className="text-2xl">{getCourseEmoji(course.categoryName)}</span>
                  <span className="block min-w-0 w-full font-sans">
                    <span className={`block font-bold text-sm truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {course.name}
                    </span>
                    <span className="block text-[10px] text-secondary-gray truncate mt-0.5">{course.categoryName || "Academic Program"}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Course Layout Split */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
            
            {/* Left Column: Semester Selection */}
            <div className="w-full lg:w-[280px] lg:shrink-0 bg-card-bg border border-border-light rounded-2xl p-4 space-y-3.5">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-1.5 px-2">
                <GraduationCap className="h-4.5 w-4.5 text-primary" />
                <span>Semester Term</span>
              </h3>
              <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                {Array.from({ length: selectedCourse?.totalSemesters || 8 }, (_, i) => i + 1).map((sem) => {
                  const isSelected = selectedSemester === sem;
                  return (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer shrink-0 transition-all ${
                        isSelected
                          ? "bg-primary text-white shadow-sm"
                          : "text-secondary-gray hover:bg-hover-card-bg hover:text-foreground"
                      }`}
                    >
                      <span>Semester {sem}</span>
                      <ChevronRight className={`hidden lg:block h-4 w-4 ${isSelected ? "text-white" : "text-secondary-gray/50"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Search + Notes Listing */}
            <div className="flex-grow w-full sm:space-y-6 space-y-4">
              
              {/* Filter / Search Bar */}
              <div className="bg-card-bg border border-border-light rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center w-full bg-background border border-border-light rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <Search className="h-4 w-4 text-secondary-gray shrink-0 ml-3.5" />
                  <input
                    type="text"
                    placeholder={`Search within ${selectedCourse?.name || ""} Sem ${selectedSemester} notes...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-w-0 pl-2 pr-4 py-2.5 bg-transparent border-0 rounded-xl text-sm text-foreground placeholder:text-secondary-gray/70 placeholder:truncate outline-none focus:ring-0"
                  />
                </div>
              </div>

              {/* Dynamic Semester Notes List */}
              {didYouMean && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/20 text-left flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="h-4 w-4" />
                  <span>Showing results for fuzzy search. (No exact match was found).</span>
                </div>
              )}

              {!selectedCourse ? (
                <div className="text-center py-16 bg-card-bg border border-border-light rounded-2xl p-8 space-y-2">
                  <BookOpen className="h-10 w-10 text-secondary-gray/40 mx-auto" />
                  <h3 className="font-bold text-foreground text-base">No Courses Registered</h3>
                  <p className="text-secondary-gray text-xs max-w-sm mx-auto">
                    There are no academic courses registered in the database yet.
                  </p>
                </div>
              ) : activeSemesterSubjects.length === 0 ? (
                <div className="text-center py-16 bg-card-bg border border-border-light rounded-2xl p-8 space-y-2">
                  <BookOpen className="h-10 w-10 text-secondary-gray/40 mx-auto" />
                  <h3 className="font-bold text-foreground text-base">No Syllabus Indexed</h3>
                  <p className="text-secondary-gray text-xs max-w-sm mx-auto">
                    We haven&apos;t added subjects or notes for {selectedCourse?.name || ""} Semester {selectedSemester} yet.
                  </p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-16 bg-card-bg border border-border-light rounded-2xl p-8 space-y-2">
                  <BookOpen className="h-10 w-10 text-secondary-gray/40 mx-auto" />
                  <h3 className="font-bold text-foreground text-base">No Notes Uploaded</h3>
                  <p className="text-secondary-gray text-xs max-w-sm mx-auto">
                    Subjects for this term: <span className="font-semibold text-foreground/80">{activeSemesterSubjects.join(", ")}</span>. No notes exist matching your query.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-card-bg border border-border-light rounded-2xl p-5 flex flex-col justify-between hover:bg-hover-card-bg hover:shadow-sm transition-all duration-200 group"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                            {note.subjectName || note.subject || "General"}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-secondary-gray font-semibold">
                            <Eye className="h-3 w-3" />
                            {note.viewCount} views
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-1">
                            {note.title}
                          </h4>
                          <p className="text-xs text-secondary-gray mt-1 leading-normal line-clamp-2">
                            {note.description || "No descriptions available for this guide."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-border-light/50">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-center group/btn text-xs font-semibold py-2 bg-card-bg border-border-light hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
                          onClick={() => {
                            if (!user) {
                              setShowLoginModal(true);
                            } else {
                              router.push(`/notes/${note.id}`);
                            }
                          }}
                        >
                          <span>Open PDF Document</span>
                          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

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
