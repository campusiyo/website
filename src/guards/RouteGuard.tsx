"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AccessLevel, UnauthenticatedBehavior } from "@/config/routeAccess";
import { Role } from "@/constants/roles";
import LoginRequiredOverlay from "@/components/LoginRequiredOverlay";
import AccessDenied403 from "@/components/AccessDenied403";

interface RouteGuardProps {
  access: AccessLevel;
  unauthenticated?: UnauthenticatedBehavior;
  children: React.ReactNode;
}

export default function RouteGuard({
  access,
  unauthenticated = "redirect",
  children,
}: RouteGuardProps) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading) {
      if (access === "USER" && !user && unauthenticated === "redirect") {
        router.push("/login");
      } else if (access === "ADMIN" && !user) {
        router.push("/login");
      }
    }
  }, [access, unauthenticated, initialized, loading, user, router]);

  // PUBLIC routes always render immediately
  if (access === "PUBLIC") {
    return <>{children}</>;
  }

  // Loading state while initializing auth
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  // USER level route protection
  if (access === "USER") {
    if (!user) {
      if (unauthenticated === "overlay") {
        return (
          <>
            {children}
            <LoginRequiredOverlay />
          </>
        );
      }
      return null;
    }
    return <>{children}</>;
  }

  // ADMIN level route protection
  if (access === "ADMIN") {
    if (!user) {
      return null;
    }
    if (user.role !== Role.ADMIN) {
      return <AccessDenied403 />;
    }
    return <>{children}</>;
  }

  return <>{children}</>;
}
