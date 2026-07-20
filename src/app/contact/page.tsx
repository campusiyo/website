"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageSquare, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setStatus("loading");
    try {
      // Simulate API Submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("success");
      setFormData({ name: "", email: "", university: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMsg("Failed to send message. Please try again later.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow">
        {/* Intro */}
        <section className="bg-white border-b border-border-light py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Contact Us
            </h1>
            <p className="mt-4 text-base sm:text-lg text-secondary-gray leading-relaxed max-w-2xl mx-auto">
              Have questions about the waitlist? Want to contribute notes for your campus? Drop us a line, and our student committee will get back to you.
            </p>
          </div>
        </section>

        {/* Contact Layout */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 max-w-5xl mx-auto">
            
            {/* Contact Details (Col-span-5) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-foreground">Direct Channels</h2>
                <p className="text-sm text-secondary-gray mt-2 leading-relaxed">
                  For university partnerships, campus representative applications, or general inquiries, you can also reach us directly:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-primary/5 rounded-lg text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">General Inquiries</h4>
                    <a href="mailto:hello@campusiyo.in" className="text-xs sm:text-sm text-primary hover:underline">
                      hello@campusiyo.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-primary/5 rounded-lg text-primary shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">FAQs</h4>
                    <p className="text-xs sm:text-sm text-secondary-gray">
                      Have a quick question? Review our answers first.
                    </p>
                    <Link href="/#faq" className="text-xs font-semibold text-primary flex items-center gap-1 mt-1 hover:underline">
                      View FAQ Desk
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              <hr className="border-border-light" />

              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
                  Social Channels
                </h3>
                <div className="flex gap-4 mt-3">
                  <a
                    href="#"
                    className="h-10 w-10 border border-border-light rounded-lg flex items-center justify-center text-secondary-gray hover:text-primary hover:border-primary/20 transition-colors"
                    aria-label="Twitter link"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="h-10 w-10 border border-border-light rounded-lg flex items-center justify-center text-secondary-gray hover:text-primary hover:border-primary/20 transition-colors"
                    aria-label="GitHub link"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="h-10 w-10 border border-border-light rounded-lg flex items-center justify-center text-secondary-gray hover:text-primary hover:border-primary/20 transition-colors"
                    aria-label="LinkedIn link"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Form Column (Col-span-7) */}
            <div className="lg:col-span-7 bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6">Send a Message</h3>
              
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                  <CheckCircle2 className="h-12 w-12 text-accent-green" />
                  <div>
                    <h4 className="font-bold text-foreground text-lg">Message sent successfully!</h4>
                    <p className="text-sm text-secondary-gray mt-1 max-w-sm">
                      Thank you for contacting Campusiyo. We review all notes inquiries and feedback submissions within 48 hours.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="name" className="text-xs font-semibold text-foreground/80">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 bg-background border border-border-light rounded-lg text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        disabled={status === "loading"}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email" className="text-xs font-semibold text-foreground/80">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@university.edu"
                        className="w-full px-4 py-2.5 bg-background border border-border-light rounded-lg text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        disabled={status === "loading"}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="university" className="text-xs font-semibold text-foreground/80">
                      University (Optional)
                    </label>
                    <input
                      id="university"
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="e.g., Delhi University"
                      className="w-full px-4 py-2.5 bg-background border border-border-light rounded-lg text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      disabled={status === "loading"}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-xs font-semibold text-foreground/80">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Type your message here..."
                      rows={5}
                      className="w-full px-4 py-2.5 bg-background border border-border-light rounded-lg text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                      disabled={status === "loading"}
                      required
                    />
                  </div>

                  {status === "error" && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full sm:w-auto"
                    isLoading={status === "loading"}
                  >
                    Submit Form
                  </Button>
                </form>
              )}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
