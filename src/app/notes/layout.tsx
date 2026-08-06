import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Study Notes",
  description:
    "Access thousands of high-quality, peer-reviewed study notes for your university courses. Organized by semester and subject for easy navigation.",
  alternates: { canonical: "https://campusiyo.in/notes" },
  openGraph: {
    title: "Study Notes | Campusiyo",
    description:
      "Find semester-organized, peer-reviewed study notes for your university courses on Campusiyo.",
    url: "https://campusiyo.in/notes",
  },
};

export default function NotesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
