"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, User, AlertCircle, ArrowRight, Compass, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DashboardData {
  userId: string;
  fullName: string;
  role: string;
  message: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, initialized } = useAuth();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !loading) {
      if (!user) {
        router.push("/login");
        return;
      }
      
      // If admin, redirect directly to admin workspace
      if (user.role === "ADMIN") {
        router.push("/admin");
        return;
      }

      // Fetch student dashboard message
      const fetchDashboard = async () => {
        try {
          const res = await api.get("/users/dashboard");
          if (res.ok) {
            const data = await res.json();
            setDashData(data);
          } else {
            setError("Could not load dashboard data.");
          }
        } catch (err) {
          setError("Failed to connect to gateway.");
        } finally {
          setDashLoading(false);
        }
      };

      fetchDashboard();
    }
  }, [user, loading, initialized, router]);

  if (loading || !initialized || (user && user.role === "ADMIN") || (dashLoading && !error)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Loading portal...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-background py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-card-bg border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {dashData?.message || `Welcome back, ${user?.fullName || "Student"}`}
              </h1>
              <p className="text-secondary-gray mt-1.5 text-sm sm:text-base">
                Your personalized university learning portal.
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold border border-primary/20 shrink-0">
              {user?.course || "Student Account"}
            </div>
          </div>

          {/* Profile Warning */}
          {user?.hasNoProfile && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-3">
                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-amber-800">Complete Your Academic Profile</h3>
                  <p className="text-xs sm:text-sm text-amber-700 mt-1">
                    Fill in your course name and semester to unlock notes specific to your curriculum.
                  </p>
                </div>
              </div>
              <Button
                variant="accent"
                size="sm"
                onClick={() => router.push("/profile")}
                className="shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Profile</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Notes Portal Card */}
            <div className="bg-card-bg border border-border-light rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Browse Study Notes</h3>
                  <p className="text-sm text-secondary-gray mt-1 leading-relaxed">
                    Search and read syllabuses, unit-wise notes, and study guides uploaded by top scores and reviewed by peers.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border-light/50">
                <Button
                  variant="primary"
                  className="w-full justify-center group py-2.5 cursor-pointer"
                  onClick={() => router.push("/notes")}
                >
                  <span>Go to Notes Directory</span>
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-card-bg border border-border-light rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Manage Profile</h3>
                  <p className="text-sm text-secondary-gray mt-1 leading-relaxed">
                    Set up your college details, select your current semester, and upload a profile picture to receive tailored suggestions.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border-light/50">
                <Button
                  variant="secondary"
                  className="w-full justify-center py-2.5 cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  <span>View My Profile</span>
                </Button>
              </div>
            </div>

          </div>

          {/* Syllabus Info Card */}
          <div className="bg-card-bg border border-border-light rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2 mb-4">
              <Compass className="h-5 w-5 text-primary" />
              Portal Status (Version 1.0)
            </h3>
            <p className="text-sm text-secondary-gray leading-relaxed">
              Welcome to the Campusiyo beta release! Student stats, achievements, and note bookmarks will be introduced in the next patch. If you encounter any bugs, please report them to support or content managers.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
