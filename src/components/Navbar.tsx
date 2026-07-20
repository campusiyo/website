"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 border-b border-border-light shadow-sm backdrop-blur-md"
          : "bg-background/90 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="Campusiyo Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                Campusiyo
              </span>
            </Link>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              Beta Soon
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary relative py-1 ${
                    isActive ? "text-primary font-semibold" : "text-secondary-gray"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Call To Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/coming-soon" className="text-sm font-medium text-secondary-gray hover:text-foreground transition-colors">
              Pre-Alpha Demo
            </Link>
            <Link href={pathname === "/" ? "#waitlist" : "/#waitlist"}>
              <Button variant="accent" size="sm" className="group">
                Join Waitlist
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link href={pathname === "/" ? "#waitlist" : "/#waitlist"}>
              <Button variant="accent" size="sm" className="px-3.5 py-1.5 text-xs">
                Waitlist
              </Button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-secondary-gray hover:text-foreground hover:bg-gray-100 transition-all focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border-light bg-white py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top duration-250">
          <nav className="flex flex-col gap-2.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    isActive
                      ? "text-primary bg-primary/5 font-semibold"
                      : "text-secondary-gray"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <hr className="border-border-light" />
          <div className="flex flex-col gap-2 px-3">
            <Link href="/coming-soon" className="text-sm font-medium text-center text-secondary-gray hover:text-foreground py-2 transition-colors">
              Pre-Alpha Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
