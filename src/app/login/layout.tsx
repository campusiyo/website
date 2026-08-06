import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Sign in to your Campusiyo account to access personalized study notes, course materials, and semester resources.",
  alternates: { canonical: "https://campusiyo.in/login" },
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
