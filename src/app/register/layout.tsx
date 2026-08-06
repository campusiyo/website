import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join Campusiyo for free. Get access to university-specific semester notes, previous year papers, and study resources curated for your degree.",
  alternates: { canonical: "https://campusiyo.in/register" },
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
