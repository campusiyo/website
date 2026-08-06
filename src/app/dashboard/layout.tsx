import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your personal Campusiyo dashboard. Track your study progress, access saved notes, and manage your academic profile.",
  alternates: { canonical: "https://campusiyo.in/dashboard" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
