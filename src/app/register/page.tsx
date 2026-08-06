"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { GraduationCap, ArrowRight, User, Shield, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    google?: any;
  }
}

function RegisterForm() {
  const router = useRouter();
  const { register, googleLogin } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  // Initialize Google Sign-in when the script is loaded
  const initializeGoogleSignIn = () => {
    if (typeof window !== "undefined" && window.google && !googleInitialized) {
      try {
        const clientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com";
        
        window.google.accounts.id.initialize({
          client_id: clientID,
          callback: async (response: any) => {
            setError(null);
            setLoading(true);
            try {
              // 4. Send credentialResponse.credential (ID Token) to backend /auth/google
              await googleLogin(response.credential);
              
              // 7. Route to dashboard upon successful JWT generation & validation
              router.push("/dashboard");
            } catch (err: any) {
              setError(err.message || "Google Sign-In validation failed on server.");
            } finally {
              setLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // 3. Render the official Google Sign-In button which triggers the Google popup
        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { 
            theme: "outline", 
            size: "large", 
            width: 280,
            text: "signup_with",
            shape: "rectangular"
          }
        );
        
        setGoogleInitialized(true);
      } catch (err) {
        console.error("Failed to initialize Google Sign-In SDK:", err);
      }
    }
  };

  // Re-run initialization if window.google loads before state updates
  useEffect(() => {
    if (typeof window !== "undefined" && window.google && !googleInitialized) {
      initializeGoogleSignIn();
    }
  }, [googleInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      await register(email, password, role);
      // Freshly registered users don't have a profile yet
      // Redirect to profile page to initialize it!
      router.push("/profile?init=true");
    } catch (err: any) {
      setError(err.message || "Registration failed. Email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 2. Load Google Identity Services SDK script */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        onLoad={initializeGoogleSignIn}
        strategy="afterInteractive"
      />
      
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-card-bg p-8 rounded-2xl border border-border-light shadow-xl transition-all duration-300 hover:shadow-2xl">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-secondary-gray">
              Start sharing and reviewing university notes
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex gap-3 text-sm items-start">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Role Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">Select Portal Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("STUDENT")}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      role === "STUDENT"
                        ? "border-primary bg-primary/[0.03] text-primary shadow-sm"
                        : "border-border-light bg-card-bg text-secondary-gray hover:border-gray-300"
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm font-semibold">Student Portal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("ADMIN")}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      role === "ADMIN"
                        ? "border-red-500 bg-red-50/10 text-red-600 shadow-sm"
                        : "border-border-light bg-card-bg text-secondary-gray hover:border-gray-300"
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-semibold">Admin Portal</span>
                  </button>
                </div>
              </div>

              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Button variant="primary" type="submit" className="w-full justify-center group py-3" isLoading={loading}>
                Register Account
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card-bg px-2 text-secondary-gray font-medium">Or Sign up with</span>
                </div>
              </div>

              {/* 1. Google Button target element */}
              <div className="w-full flex justify-center py-1">
                <div id="google-signup-btn" className="w-full flex justify-center min-h-[44px]"></div>
              </div>
            </div>
          </form>

          <p className="text-center text-sm text-secondary-gray">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
              Sign in instead
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
