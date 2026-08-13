"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AccessDenied403() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-background px-4 py-20">
        <div className="max-w-md w-full bg-card-bg border border-border-light p-8 rounded-2xl shadow-xl text-center space-y-6">
          <div className="mx-auto h-14 w-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 border border-red-200">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">403 Access Denied</h2>
            <p className="text-sm text-secondary-gray leading-relaxed">
              You do not have administrative privileges required to access this portal workspace.
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
