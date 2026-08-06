"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { LayoutContext } from "@/context/LayoutContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The PDF Reader page has the route structure: /notes/[id]
  // We identify it by checking if it starts with "/notes/" and contains the document ID.
  // Note: /notes is just a redirect to /courses, but we exclude the reader view specifically.
  const isPdfReader = pathname.startsWith("/notes/") && pathname.split("/").filter(Boolean).length === 2;

  if (isPdfReader) {
    return <>{children}</>;
  }

  return (
    <LayoutContext.Provider value={{ isLayoutActive: true }}>
      <Navbar isLayout={true} />
      <div className="flex-grow flex flex-col min-h-[calc(100vh-3.5rem)]">
        {children}
      </div>
      <Footer isLayout={true} />
    </LayoutContext.Provider>
  );
}
