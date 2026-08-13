import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mobile Splash Screen Demo",
  description: "Experience the vector-based mobile splash screen animation for the Campusiyo mobile app.",
  robots: { index: false, follow: false },
};

export default function SplashDemoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
