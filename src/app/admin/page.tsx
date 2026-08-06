"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BarChart3, BookOpen, Layers, Eye, FolderHeart, UploadCloud, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PlatformStats {
  totalSubjects: number;
  totalPublishedNotes: number;
  totalViewsAcrossNotes: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setError("Failed to retrieve platform analytics.");
        }
      } catch (err) {
        setError("Gateway link error while loading admin metrics.");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (statsLoading && !error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Loading analytics dashboard...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-background py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-light pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Admin Command Center
              </h1>
              <p className="text-xs sm:text-sm text-secondary-gray mt-0.5">
                Oversee academic notes curation, syllabus subject indexes, and platform statistics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/notes")}
                className="cursor-pointer text-xs h-8.5 py-0 px-3"
              >
                View Note Directory
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/admin/upload")}
                className="cursor-pointer text-xs h-8.5 py-0 px-3 flex items-center gap-1.5"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload Study Note</span>
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Stats Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Total Subjects Card */}
            <div className="bg-card-bg border border-border-light rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-wider">Active Subjects</span>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats?.totalSubjects || 0}</p>
              </div>
            </div>

            {/* Total Published Notes Card */}
            <div className="bg-card-bg border border-border-light rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center shrink-0 border border-accent-green/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-wider">Published PDFs</span>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats?.totalPublishedNotes || 0}</p>
              </div>
            </div>

            {/* Total Views Card */}
            <div className="bg-card-bg border border-border-light rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-amber-100/60 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-wider">Total Note Views</span>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats?.totalViewsAcrossNotes || 0}</p>
              </div>
            </div>

          </div>

          {/* Quick Management Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            
            {/* Category CRUD Tool */}
            <div className="bg-card-bg border border-border-light rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
              <div className="space-y-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Manage Categories</h3>
                  <p className="text-xs text-secondary-gray mt-1 leading-relaxed">
                    Create, update, and delete parent catalog branches (e.g. Engineering & Tech, Pure Sciences, Business & Commerce) and define their icons.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border-light/50">
                <Button
                  variant="secondary"
                  className="w-full justify-center group flex items-center gap-1.5 py-1.5 text-xs cursor-pointer h-8"
                  onClick={() => router.push("/admin/categories")}
                >
                  <span>Go to Categories Board</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>

            {/* Course CRUD Tool */}
            <div className="bg-card-bg border border-border-light rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
              <div className="space-y-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Manage Degree Courses</h3>
                  <p className="text-xs text-secondary-gray mt-1 leading-relaxed">
                    Map degree titles (e.g. B.Tech Computer Science, Bachelor of Commerce) to parent categories for customized student discovery.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border-light/50">
                <Button
                  variant="secondary"
                  className="w-full justify-center group flex items-center gap-1.5 py-1.5 text-xs cursor-pointer h-8"
                  onClick={() => router.push("/admin/courses")}
                >
                  <span>Go to Courses Board</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>

            {/* Subject CRUD Tool */}
            <div className="bg-card-bg border border-border-light rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
              <div className="space-y-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Manage Subject Database</h3>
                  <p className="text-xs text-secondary-gray mt-1 leading-relaxed">
                    Create, update, and remove academic subjects across courses and semesters. Notes uploaded must be indexed to a specific subject.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border-light/50">
                <Button
                  variant="secondary"
                  className="w-full justify-center group flex items-center gap-1.5 py-1.5 text-xs cursor-pointer h-8"
                  onClick={() => router.push("/admin/subjects")}
                >
                  <span>Go to Subjects Board</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>

            {/* Notes CRUD Tool */}
            <div className="bg-card-bg border border-border-light rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
              <div className="space-y-3">
                <div className="h-9 w-9 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Manage Uploaded Notes</h3>
                  <p className="text-xs text-secondary-gray mt-1 leading-relaxed">
                    View list of registered notes in the catalog, search by subject and description details, track view counts, and remove outdated materials.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border-light/50">
                <Button
                  variant="secondary"
                  className="w-full justify-center group flex items-center gap-1.5 py-1.5 text-xs cursor-pointer h-8"
                  onClick={() => router.push("/admin/notes")}
                >
                  <span>Go to Notes Catalog</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>

            {/* Note Upload Tool */}
            <div className="bg-card-bg border border-border-light rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
              <div className="space-y-3">
                <div className="h-9 w-9 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center">
                  <UploadCloud className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Upload & Categorize Notes</h3>
                  <p className="text-xs text-secondary-gray mt-1 leading-relaxed">
                    Select compiled PDF materials, write descriptive guidelines, specify course subjects, and upload them to the repository for student access.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border-light/50">
                <Button
                  variant="secondary"
                  className="w-full justify-center group flex items-center gap-1.5 py-1.5 text-xs cursor-pointer h-8"
                  onClick={() => router.push("/admin/upload")}
                >
                  <span>Open Upload Wizard</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>

          </div>

          {/* Admin guidelines card */}
          <div className="bg-card-bg border border-border-light rounded-xl p-4 shadow-sm flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Important Administration Notice</h3>
              <p className="text-xs text-secondary-gray leading-relaxed mt-0.5">
                All uploaded note files must be under 25MB and verified for visual readability. Subject entries must specify correct semesters (1-8) and standard course designations (e.g. B.Tech CSE, B.Com, MBA) to maintain organized directory alignment for students.
              </p>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
