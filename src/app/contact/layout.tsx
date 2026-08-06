import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Campusiyo team. Report issues, suggest improvements, or reach out for partnerships and academic support.",
  alternates: { canonical: "https://campusiyo.in/contact" },
  openGraph: {
    title: "Contact Us | Campusiyo",
    description:
      "Reach the Campusiyo team for support, partnerships, or feedback about university study notes.",
    url: "https://campusiyo.in/contact",
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
