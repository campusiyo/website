"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/constants/roles";
import RouteGuard from "@/guards/RouteGuard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Shield, CheckCircle2, AlertCircle } from "lucide-react";

function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, initialized, updateProfile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState<number>(1);
  const [designation, setDesignation] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isInitMode = searchParams.get("init") === "true" || user?.hasNoProfile;

  useEffect(() => {
    if (initialized && !loading && user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setCourse(user.course || "");
      setSemester(user.semester || 1);
      setDesignation(user.designation || "");
      setProfilePictureUrl(user.profilePictureUrl || "");
    }
  }, [user, loading, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setFormLoading(true);

    if (!fullName.trim()) {
      setErrorMsg("Full Name is required.");
      setFormLoading(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        profilePictureUrl: profilePictureUrl.trim() || undefined,
      };

      if (user?.role === Role.STUDENT) {
        payload.course = course.trim() || undefined;
        payload.semester = semester ? Number(semester) : undefined;
      } else if (user?.role === Role.ADMIN) {
        payload.designation = designation.trim() || undefined;
      }

      await updateProfile(payload);
      setSuccessMsg("Your profile has been saved successfully.");

      await refreshProfile();

      if (isInitMode) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile details.";
      setErrorMsg(message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Loading profile...</span>
      </div>
    );
  }

  return (
    <RouteGuard access="USER" unauthenticated="redirect">
      <Navbar />
      <main className="flex-grow bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto space-y-6">

          {isInitMode && (
            <div className="bg-primary/5 border border-primary/20 text-primary p-5 rounded-2xl flex gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <span className="font-bold text-base">Welcome to Campusiyo!</span>
                <p className="text-secondary-gray mt-1 leading-relaxed">
                  Please complete your details below. Your course and semester choice are used to customize note recommendations on your dashboard.
                </p>
              </div>
            </div>
          )}

          <div className="bg-card-bg border border-border-light rounded-2xl shadow-xl overflow-hidden">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-primary to-primary-hover px-8 py-6 text-white flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Profile Settings</h1>
                <p className="text-xs text-white/80 mt-1">Manage your account details and academic configurations</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-card-bg/10 flex items-center justify-center border border-white/20 shrink-0">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex gap-3 text-sm items-start">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-green mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex gap-3 text-sm items-start">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Account Role Badge */}
                <div className="flex justify-between items-center border border-border-light bg-gray-55/10 rounded-xl p-3.5 text-sm">
                  <span className="font-medium text-secondary-gray">User Authority</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    user?.role === Role.ADMIN ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"
                  }`}>
                    {user?.role === Role.ADMIN ? <Shield className="h-3 w-3" /> : null}
                    {user?.role || Role.STUDENT}
                  </span>
                </div>

                {/* Full Name */}
                <Input
                  label="Full Name"
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                {/* Email Address */}
                <Input
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {/* Profile Picture URL */}
                <Input
                  label="Profile Picture URL (Optional)"
                  id="profilePictureUrl"
                  name="profilePictureUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profilePictureUrl}
                  onChange={(e) => setProfilePictureUrl(e.target.value)}
                />

                {/* Student specific fields */}
                {user?.role === Role.STUDENT && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-light/50 mt-4">
                    <Input
                      label="Degree Course"
                      id="course"
                      name="course"
                      placeholder="e.g. B.Tech CSE"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="semester" className="text-sm font-medium text-foreground/80">
                        Current Semester
                      </label>
                      <select
                        id="semester"
                        name="semester"
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Admin specific fields */}
                {user?.role === Role.ADMIN && (
                  <div className="pt-2 border-t border-border-light/50 mt-4">
                    <Input
                      label="Staff Designation"
                      id="designation"
                      name="designation"
                      placeholder="e.g. Content Manager, Administrator"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border-light/50 flex gap-3">
                <Button
                  variant="primary"
                  type="submit"
                  className="flex-grow justify-center py-2.5 cursor-pointer"
                  isLoading={formLoading}
                >
                  Save Profile Settings
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2.5 cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>

        </div>
      </main>
      <Footer />
    </RouteGuard>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <ProfileForm />
    </Suspense>
  );
}
