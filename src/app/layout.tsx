import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#13151C" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://campusiyo.in"),

  title: {
    default: "Campusiyo | Find Organized University Study Notes",
    template: "%s | Campusiyo",
  },

  applicationName: "Campusiyo",

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
    "B.Tech notes",
    "engineering notes India",
    "previous year papers",
  ],

  authors: [{ name: "Campusiyo Team", url: "https://campusiyo.in" }],
  creator: "Campusiyo",
  publisher: "Campusiyo",
  category: "education",
  classification: "Education, Study Resources",
  referrer: "strict-origin-when-cross-origin",

  icons: {
    icon: [
      { url: "/favicon-16x16.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/favicon-32x32.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon-48x48.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://campusiyo.in",
    title: "Campusiyo | University Study Notes",
    description:
      "Get access to organized, peer-reviewed, university-wise and semester-wise study notes. Ace your exams with Campusiyo.",
    siteName: "Campusiyo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Campusiyo — University Study Notes Portal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@campusiyo",
    title: "Campusiyo | University Study Notes",
    description:
      "Get access to organized, peer-reviewed, university-wise and semester-wise study notes. Ace your exams with Campusiyo.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "https://campusiyo.in",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { AuthProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <style dangerouslySetInnerHTML={{ __html: `
          @media (min-width: 1024px) {
            html {
              scrollbar-gutter: stable;
            }
          }
          html, body {
            background-color: #13151C;
          }
          html.dark, html.dark body {
            background-color: #13151C;
          }
          html:not(.dark), html:not(.dark) body {
            background-color: #FAFAFA;
          }
        `}} />
        {/* Theme detection — runs before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('campusiyo_theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches,i=t||(d?'dark':'light');if(i==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`,
          }}
        />
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Campusiyo",
              url: "https://campusiyo.in",
              logo: "https://campusiyo.in/campusiyo-light-logo.png",
              description: "University study notes platform for Indian college students. Organized, peer-reviewed, semester-wise study materials.",
              email: "campusiyo.official@gmail.com",
              sameAs: [
                "https://www.instagram.com/campusiyo/",
                "https://www.linkedin.com/company/campusiyo/about/",
                "https://www.facebook.com/",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "campusiyo.official@gmail.com",
                availableLanguage: ["English", "Hindi"],
              },
            }),
          }}
        />
        {/* JSON-LD: WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Campusiyo",
              url: "https://campusiyo.in",
              description: "Get access to organized, peer-reviewed, university-wise and semester-wise study notes.",
              inLanguage: "en-IN",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://campusiyo.in/courses?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col bg-background text-foreground`}>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}

