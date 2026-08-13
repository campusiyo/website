"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { GraduationCap, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleLogin } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExpiredMsg, setShowExpiredMsg] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  useEffect(() => {
    if (searchParams.get("expired")) {
      setShowExpiredMsg(true);
    }
  }, [searchParams]);

  // Initialize Google Sign-in when the script is loaded
  const initializeGoogleSignIn = () => {
    if (typeof window !== "undefined" && window.google && !googleInitialized) {
      try {
        const clientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1087453987123-campusiyo.apps.googleusercontent.com";

        window.google.accounts.id.initialize({
          client_id: clientID,
          callback: async (response: any) => {
            setError(null);
            setLoading(true);
            try {
              // Send credentialResponse.credential (ID Token) to backend /auth/google
              await googleLogin(response.credential);
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

        // Render the official Google Sign-In button
        const targetBtn = document.getElementById("google-signin-btn");
        if (targetBtn) {
          window.google.accounts.id.renderButton(targetBtn, {
            theme: "outline",
            size: "large",
            width: "280",
            text: "signin_with",
            shape: "rectangular",
          });
        }

        setGoogleInitialized(true);
      } catch (err) {
        console.error("Failed to initialize Google Sign-In SDK:", err);
      }
    }
  };

  const handleCustomGoogleSignIn = () => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("GIS Prompt status:", notification.getNotDisplayedReason() || notification.getSkippedReason());
          }
        });
      } catch (e) {
        console.error("Google Sign-In prompt error:", e);
      }
    } else {
      setError("Google Sign-In is loading. Please check your internet connection or try again in a moment.");
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

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
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
      <main className="flex-grow flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="w-full max-w-md mx-auto space-y-8 bg-card-bg p-6 sm:p-8 rounded-2xl border border-border-light shadow-xl transition-all duration-300 hover:shadow-2xl">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              Sign in to Campusiyo
            </h2>
            <p className="mt-2 text-sm text-secondary-gray">
              Access your college notes & syllabuses
            </p>
          </div>

          {showExpiredMsg && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 text-sm items-start">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-semibold">Session Expired</span>
                <p className="text-xs text-amber-700 mt-1">Please sign in again to access the notes portal.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex gap-3 text-sm items-start">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border-light rounded cursor-pointer animate-none"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-gray cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-hover">
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="primary" type="submit" className="w-full justify-center group py-3" isLoading={loading}>
                Sign In
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card-bg px-2 text-secondary-gray font-medium">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-In Container */}
              <div className="w-full flex flex-col items-center gap-2 py-1">
                <div id="google-signin-btn" className="w-full flex justify-center min-h-[44px]"></div>
                {!googleInitialized && (
                  <button
                    type="button"
                    onClick={handleCustomGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border-light hover:border-primary/40 bg-card-bg hover:bg-hover-card-bg text-foreground text-sm font-semibold transition-all shadow-xs cursor-pointer min-h-[44px]"
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                )}
              </div>
            </div>
          </form>

          <p className="text-center text-sm text-secondary-gray">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:text-primary-hover">
              Sign up now
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
