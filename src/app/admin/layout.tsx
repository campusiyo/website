"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, initialized } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (initialized && !loading) {
      if (!user) {
        router.push("/login");
        return;
      }
      
      if (user.role !== "ADMIN") {
        setAccessDenied(true);
      }
    }
  }, [user, loading, initialized, router]);

  // Loading state
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Checking credentials...</span>
      </div>
    );
  }

  // Gated Access Denied layout for non-admins
  if (accessDenied) {
    return (
      <>
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-background px-4 py-20">
          <div className="max-w-md w-full bg-card-bg border border-border-light p-8 rounded-2xl shadow-xl text-center space-y-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 border border-red-200">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Access Denied</h2>
              <p className="text-sm text-secondary-gray leading-relaxed">
                You do not have administrative privileges required to access the admin portal workspace.
              </p>
            </div>
            <div className="pt-4 border-t border-border-light/50">
              <Button
                variant="primary"
                className="w-full justify-center flex items-center gap-2 cursor-pointer"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Student Dashboard</span>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Granted layout
  return <>{children}</>;
}
