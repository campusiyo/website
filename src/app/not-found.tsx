import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Navbar />

      <main className="flex-grow flex items-center justify-center bg-background py-20 sm:py-32">
        <div className="max-w-md w-full px-6 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/5 text-primary mb-6">
            <FileQuestion className="h-8 w-8" />
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            404
          </h1>
          <h2 className="text-xl font-semibold text-foreground mt-4">
            Notes Not Found
          </h2>
          
          <p className="mt-4 text-sm sm:text-base text-secondary-gray leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been relocated as we prepare for the official Campusiyo launch.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full group">
                <Home className="mr-1.5 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/#waitlist" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Join the Waitlist
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
