import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "My Profile",
  description:
    "Manage your Campusiyo profile, update your university and degree details, and customize your study preferences.",
  alternates: { canonical: "https://campusiyo.in/profile" },
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
