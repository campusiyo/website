import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Course Directory",
  description:
    "Browse semester-wise study notes organized by degree programs — B.Tech, B.Com, B.Sc, BBA, B.A. and more. Find notes for your exact course and semester.",
  alternates: { canonical: "https://campusiyo.in/courses" },
  openGraph: {
    title: "Course Directory | Campusiyo",
    description:
      "Browse peer-reviewed study notes organized by degree and semester on Campusiyo.",
    url: "https://campusiyo.in/courses",
  },
};

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
