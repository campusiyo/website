import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Campusiyo | Find Organized University Study Notes",
    template: "%s | Campusiyo",
  },
  description:
    "Get access to organized, peer-reviewed, university-wise and semester-wise study notes. Ace your exams with Campusiyo.",

  verification: {
    google: "QHr6G2FEItujyjrSoZirsfOfBqQQJwA8CxgcTPntk7I",
  },

  keywords: [
    "Campusiyo",
    "university notes",
    "college study guides",
    "semester notes",
    "exam prep",
    "student resources",
    "lecture notes",
  ],
  authors: [{ name: "Campusiyo Team" }],
  creator: "Campusiyo",
  metadataBase: new URL("https://campusiyo.in"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://campusiyo.in",
    title: "Campusiyo | Find Organized University Study Notes",
    description:
      "Get access to organized, peer-reviewed, university-wise and semester-wise study notes. Ace your exams with Campusiyo.",
    siteName: "Campusiyo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campusiyo | Find Organized University Study Notes",
    description:
      "Get access to organized, peer-reviewed, university-wise and semester-wise study notes. Ace your exams with Campusiyo.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

