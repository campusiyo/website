"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User as UserIcon, Shield, Bell, Settings, HelpCircle, BookOpen, Clock, Heart, Edit3, ArrowRight, Home, Info, BookMarked, Moon, Sun, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/constants/roles";

import { LayoutContext } from "@/context/LayoutContext";

export default function Navbar({ isLayout }: { isLayout?: boolean }) {
  const { isLayoutActive } = React.useContext(LayoutContext);
  
  if (isLayoutActive && !isLayout) {
    return null;
  }
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(56);
  const headerRef = React.useRef<HTMLElement>(null);
  
  // Profile Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Notifications Dropdown State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading, initialized } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize theme status on mount based on head script results
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [isOpen, scrolled]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("campusiyo_theme", newTheme);
      } catch (e) {
        console.warn("Could not save theme selection to localStorage:", e);
      }
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // Close drawers/menus on route change
  useEffect(() => {
    setIsOpen(false);
    setIsDrawerOpen(false);
    setIsNotifOpen(false);
  }, [pathname]);
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // Prevent background scrolling while mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // Close drawer on Escape keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Trap focus inside mobile drawer while open
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusableElements = drawerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements.length) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Focus the first element (Close button) when mobile drawer opens
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  const hamburgerRef = React.useRef<HTMLButtonElement>(null);
  const isFirstMount = React.useRef(true);
  
  // Swipe gesture refs
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    // Swipe left to close: touchStartX - touchEndX > 60
    if (touchStartX.current - touchEndX.current > 60) {
      setIsOpen(false);
    }
  };

  // Restore focus to hamburger button on close
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!isOpen && mounted) {
      hamburgerRef.current?.focus();
    }
  }, [isOpen, mounted]);



  // Dynamic Navbar Items based on User Role
  const navLinks = user?.role === Role.ADMIN
    ? [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/courses", label: "Courses" },
        { href: "/admin/subjects", label: "Subjects" },
        { href: "/admin/notes", label: "Notes" },
        { href: "/admin/categories", label: "Categories" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/courses", label: "Courses" },
        { href: "/subjects", label: "Subjects" },
        { href: "/about", label: "About" },
      ];

  const userDisplayName = user?.fullName || "Student";
  const userDisplayEmail = user?.email || "student@gmail.com";

  return (
    <>
      <header
        ref={headerRef}
        suppressHydrationWarning
        className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
          scrolled
            ? "bg-navbar-bg/95 border-b border-border-light dark:border-[#13151C] shadow-sm backdrop-blur-md"
            : "bg-navbar-bg/90 border-b border-transparent dark:border-[#13151C] backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center gap-2 md:w-[200px] shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative h-8 w-8 transition-transform duration-300 group-hover:scale-105 hidden md:block">
                  <Image
                    src="/campusiyo-light-logo.png"
                    alt="Campusiyo - University Study Notes Portal (Light Logo)"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain dark:hidden"
                    priority
                  />
                  <Image
                    src="/campusiyo-dark-logo.png"
                    alt="Campusiyo - University Study Notes Portal (Dark Logo)"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain hidden dark:block"
                    priority
                  />
                </div>
                <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                  Campusiyo
                </span>
              </Link>
              {mounted && user?.role === Role.ADMIN && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>

            {/* Desktop Nav Links (Identical before & after login) */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => {
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

            {/* Desktop Action Items */}
            <div className="hidden md:flex items-center justify-end gap-3 shrink-0">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-border-light hover:bg-gray-100 dark:hover:bg-slate-800 text-secondary-gray hover:text-foreground transition-colors duration-200 cursor-pointer w-9 h-9 flex items-center justify-center shrink-0"
                aria-label="Toggle Theme"
                suppressHydrationWarning
              >
                {!mounted ? (
                  <div className="h-5 w-5" />
                ) : theme === "light" ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 9.9a5 5 0 117.072-7.072 5 5 0 01-7.072 7.072z" />
                  </svg>
                )}
              </button>

              {!mounted || loading || !initialized ? (
                <div className="flex items-center gap-3 justify-end shrink-0 w-[168px]">
                  <div className="h-9 w-9 rounded-lg bg-slate-700/20 animate-pulse shrink-0" />
                  <div className="flex items-center rounded-full border border-border-light p-0.5 pr-3 h-9 shrink-0 w-[120px]">
                    <div className="h-8 w-8 rounded-full bg-slate-700/20 animate-pulse shrink-0" />
                    <div className="ml-2 h-4 w-[60px] rounded bg-slate-700/20 animate-pulse shrink-0" />
                  </div>
                </div>
              ) : user ? (
                /* Logged In Experience: Notifications + Avatar */
                <div className="flex items-center gap-3 relative justify-end shrink-0 w-[168px]">
                  {/* Notifications Icon with dropdown */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="p-2 rounded-lg border border-border-light hover:bg-gray-100 dark:hover:bg-slate-800 text-secondary-gray hover:text-foreground transition-all cursor-pointer relative flex items-center justify-center h-9 w-9"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                    </button>

                    {isNotifOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-card-bg border border-border-light rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-border-light animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="p-3 bg-gray-50 dark:bg-slate-800/40 text-xs font-semibold text-secondary-gray uppercase tracking-wider flex justify-between items-center">
                          <span>Notifications</span>
                          <button onClick={() => setIsNotifOpen(false)} className="hover:text-foreground">Close</button>
                        </div>
                        <div className="p-4 text-center text-xs text-secondary-gray space-y-1">
                          <p className="font-bold text-foreground">Welcome to Campusiyo Portal</p>
                          <p className="text-[10px]">Your account is registered successfully. Browse and review subjects.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Avatar Button -> toggles Side Drawer */}
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center gap-2 border border-border-light hover:border-primary/40 rounded-full p-0.5 pr-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all cursor-pointer h-9 shrink-0 w-[120px]"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 overflow-hidden">
                      {user.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-4.5 w-4.5" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground w-[60px] truncate text-left">
                      {user.fullName?.split(" ")[0] || "Profile"}
                    </span>
                  </button>
                </div>
              ) : (
                /* Logged Out Experience: Login & Sign Up */
                <div className="flex items-center gap-3 justify-end shrink-0 w-[168px]">
                  <Link href="/login" className="text-sm font-semibold text-secondary-gray hover:text-foreground transition-colors px-2 py-1 shrink-0">
                    Login
                  </Link>
                  <Link href="/register" className="shrink-0">
                    <Button variant="primary" size="sm" className="group shrink-0 h-9 w-[111px] justify-center">
                      Sign Up
                      <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-border-light text-secondary-gray hover:text-foreground transition-all cursor-pointer mr-1 w-8 h-8 flex items-center justify-center"
                aria-label="Toggle Theme"
                suppressHydrationWarning
              >
                {!mounted ? (
                  <div className="h-4.5 w-4.5" />
                ) : theme === "light" ? (
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 9.9a5 5 0 117.072-7.072 5 5 0 01-7.072 7.072z" />
                  </svg>
                )}
              </button>

              <div className="w-auto sm:w-[76px] flex justify-end items-center gap-2 shrink-0">
                {!mounted || loading || !initialized ? (
                  <div className="h-8 w-16 bg-slate-800/10 dark:bg-slate-800/20 rounded-lg animate-pulse" />
                ) : user ? (
                  <>
                    <div className="relative flex items-center justify-center h-8 w-8">
                      <button
                        onClick={() => {
                          setIsNotifOpen(!isNotifOpen);
                          setHasUnread(false); // mark as read on click
                        }}
                        className="p-1.5 rounded-lg border border-border-light text-secondary-gray hover:text-foreground transition-all cursor-pointer relative flex items-center justify-center h-8 w-8"
                        aria-label="Mobile Notifications"
                      >
                        <Bell className="h-4.5 w-4.5" />
                        {hasUnread && (
                          <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </button>
                      {isNotifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-card-bg border border-border-light rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-border-light animate-in fade-in slide-in-from-top-2 duration-150 text-foreground">
                          <div className="p-2.5 bg-gray-50 dark:bg-slate-800/40 text-[10px] font-semibold text-secondary-gray uppercase tracking-wider flex justify-between items-center">
                            <span>Notifications</span>
                            <button onClick={() => setIsNotifOpen(false)} className="hover:text-foreground">Close</button>
                          </div>
                          <div className="p-3 text-center text-xs text-secondary-gray space-y-1">
                            <p className="font-bold text-foreground">Welcome to Campusiyo Portal</p>
                            <p className="text-[10px]">Your account is registered successfully. Browse and review subjects.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 overflow-hidden cursor-pointer"
                    >
                      {user.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )}
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="hidden sm:block shrink-0">
                    <Button variant="primary" size="sm" className="px-3.5 py-1.5 text-xs shrink-0">
                      Login
                    </Button>
                  </Link>
                )}
              </div>

              <button
                ref={hamburgerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-secondary-gray hover:text-foreground hover:bg-gray-100 dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
                aria-label="Toggle Menu"
                suppressHydrationWarning
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              />

              {/* Drawer Container */}
              <motion.div
                ref={drawerRef}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="fixed inset-y-0 left-0 h-screen h-[100dvh] max-h-[100dvh] w-[85vw] min-w-[280px] max-w-[340px] bg-card-bg border-r border-border-light shadow-2xl z-[60] md:hidden flex flex-col justify-between text-foreground select-none overflow-y-auto"
              >
                <div className="flex flex-col h-full overflow-y-auto">
                  {/* Drawer Header with App Info and Close Button */}
                  <div className="p-4 pt-[calc(1.5rem+env(safe-area-inset-top))] flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative h-8 w-8 shrink-0">
                        <Image
                          src="/campusiyo-light-logo.png"
                          alt="Campusiyo"
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain dark:hidden"
                        />
                        <Image
                          src="/campusiyo-dark-logo.png"
                          alt="Campusiyo"
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain hidden dark:block"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-lg text-foreground leading-none">Campusiyo</span>
                        <span className="text-[10px] text-secondary-gray mt-0.5 font-medium truncate">Student Learning Platform</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="h-11 w-11 flex items-center justify-center rounded-xl border border-border-light text-secondary-gray hover:bg-hover-card-bg hover:text-foreground active:scale-95 transition-all cursor-pointer shrink-0"
                      aria-label="Close Menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <hr className="border-border-light mx-4" />

                  {/* Drawer Navigation Links */}
                  <nav className="p-4 flex flex-col gap-2">
                    {[
                      { href: "/", label: "Home", description: "Main portal dashboard", icon: Home },
                      { href: "/courses", label: "Courses", description: "University catalog & guides", icon: BookOpen },
                      { href: "/subjects", label: "Subjects", description: "Syllabus exam notes & PYQs", icon: BookMarked },
                      { href: "/about", label: "About", description: "Our mission & roadmap", icon: Info },
                    ].map((link) => {
                      const isActive = pathname === link.href;
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`relative flex items-center gap-3.5 px-4 h-[52px] rounded-xl hover:bg-hover-card-bg transition-colors duration-200 cursor-pointer ${
                            isActive
                              ? "text-primary bg-primary/5 font-semibold"
                              : "text-secondary-gray"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-primary rounded-r-md" />
                          )}
                          <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : "text-secondary-gray"}`} />
                          <div className="flex flex-col min-w-0">
                            <span className={`text-[15px] leading-tight ${isActive ? "text-primary font-semibold" : "text-foreground font-medium"}`}>
                              {link.label}
                            </span>
                            <span className="text-[11px] text-secondary-gray truncate">
                              {link.description}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Drawer Footer Panel */}
                <div className="p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-border-light bg-card-bg mt-auto flex flex-col gap-2">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3.5 px-4 h-[52px] rounded-xl hover:bg-hover-card-bg transition-colors duration-200 cursor-pointer text-secondary-gray hover:text-foreground text-left"
                  >
                    {theme === "light" ? (
                      <>
                        <Moon className="h-5 w-5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[15px] leading-tight font-medium text-foreground">Dark Mode</span>
                          <span className="text-[11px] text-secondary-gray">Switch to dark theme</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Sun className="h-5 w-5 shrink-0 text-amber-500" />
                        <div className="flex flex-col">
                          <span className="text-[15px] leading-tight font-medium text-foreground">Light Mode</span>
                          <span className="text-[11px] text-secondary-gray">Switch to light theme</span>
                        </div>
                      </>
                    )}
                  </button>

                  {/* Settings Link */}
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3.5 px-4 h-[52px] rounded-xl hover:bg-hover-card-bg transition-colors duration-200 cursor-pointer text-secondary-gray hover:text-foreground"
                  >
                    <Settings className="h-5 w-5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[15px] leading-tight font-medium text-foreground">Settings</span>
                      <span className="text-[11px] text-secondary-gray">Manage your account profile</span>
                    </div>
                  </Link>

                  {/* Auth Actions (if logged out) */}
                  {!user && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-border-light/50 mt-2">
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-center text-sm py-2">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        <Button variant="primary" className="w-full justify-center text-sm py-2">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Version tag */}
                  <div className="text-[11px] text-secondary-gray/50 font-semibold tracking-wider uppercase text-center mt-2">
                    Version 1.0
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Profile Side Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed left-0 right-0 bottom-0 z-40 flex justify-end items-stretch"
          style={{ top: `${headerHeight}px` }}
        >
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-full h-full bg-card-bg dark:bg-card-bg border-l border-border-light shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 z-10 text-foreground">
            
            {/* Drawer Header */}
            <div>
              <div className="p-6 bg-gradient-to-r from-primary to-primary-hover text-white flex items-start justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-card-bg blur-xl h-20 w-32 rounded-full -top-10 -right-10" />
                <div className="flex items-center gap-3.5 z-10">
                  <div className="h-12 w-12 rounded-full bg-card-bg/10 flex items-center justify-center text-white border border-white/20 shrink-0 overflow-hidden shadow-inner">
                    {user?.profilePictureUrl ? (
                      <img src={user.profilePictureUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base truncate leading-snug">{userDisplayName}</h3>
                    <p className="text-xs text-white/80 truncate mt-0.5">{userDisplayEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-card-bg/10 text-white/80 hover:text-white transition-all cursor-pointer shrink-0 z-10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="p-4 space-y-1">
                {[
                  { label: "My Profile", href: "/profile", icon: UserIcon },
                  { label: "Saved Notes", href: "/dashboard", icon: Heart },
                  { label: "Recently Viewed", href: "/courses", icon: Clock },
                  { label: "Notifications", href: "/dashboard", icon: Bell },
                  { label: "Edit Profile", href: "/profile", icon: Edit3 },
                  { label: "Settings", href: "/profile", icon: Settings },
                  { label: "Help & Support", href: "/contact", icon: HelpCircle },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-secondary-gray hover:text-primary hover:bg-hover-card-bg transition-all cursor-pointer group"
                    >
                      <Icon className="h-4.5 w-4.5 text-secondary-gray group-hover:text-primary transition-colors shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer / Logout Button */}
            <div className="p-4 border-t border-border-light/60 bg-gray-50/50 dark:bg-slate-800/10">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/30 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-950/20 transition-all cursor-pointer group"
              >
                <LogOut className="h-4.5 w-4.5 text-red-500 dark:text-red-400 group-hover:translate-x-0.5 transition-transform" />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
