import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read the Terms and Conditions of Campusiyo, governing the use of our pre-launch portal, waitlist subscriptions, and future contributions.",
};

export default function Terms() {
  return (
    <>
      <Navbar />

      <main className="flex-grow bg-background py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white border border-border-light rounded-2xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-foreground border-b border-border-light pb-6">
            Terms & Conditions
          </h1>
          <p className="text-xs text-secondary-gray mt-2">
            Last Updated: July 20, 2026
          </p>

          <div className="mt-8 space-y-6 text-sm sm:text-base text-secondary-gray leading-relaxed">
            <p>
              Welcome to Campusiyo. These Terms and Conditions govern your access to and use of our pre-launch website and waitlist features. By browsing our website or signing up for the waitlist, you agree to these terms.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">1. Pre-Launch Website Nature</h2>
            <p>
              This website serves as a pre-launch marketing portal for Campusiyo. The fully functional notes repository, user profiles, dashboards, and AI tools are currently under development. Signing up on our waitlist does not guarantee immediate access to study notes or academic services.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">2. Waitlist Registration</h2>
            <p>
              When joining our waitlist, you agree to supply a correct and active email address. You agree that Campusiyo may email you periodic platform updates, launch announcements, and requests for note contributions. You can cancel your subscription at any time.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">3. Intellectual Property Rights</h2>
            <p>
              Unless otherwise specified, all branding elements, logos, custom website layouts, graphics, text, and code assets are the exclusive intellectual property of Campusiyo. You may not copy, modify, republish, or distribute any site designs or assets without written consent from us.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">4. User Feedback and Submissions</h2>
            <p>
              If you submit ideas, roadmap requests, or general inquiries via our contact form, you grant Campusiyo the royalty-free, non-exclusive right to utilize and incorporate your suggestions into the platform without compensation or recognition.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">5. Pre-launch Notes Contributions</h2>
            <p>
              Any student expressing interest in contributing notes during this pre-launch phase represents that they are the primary author or copyright owner of those study materials. Once the note submission dashboard goes live, contributors must adhere to our academic integrity policies.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">6. Disclaimer of Warranties</h2>
            <p>
              THE WEBSITE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. CAMPUSIYO MAKES NO WARRANTIES, EXPRESSED OR IMPLIED, REGARDING THE SPEED, ACCURACY, TIMELINES, OR COMPLETENESS OF THE CONTENT ON THIS PRE-LAUNCH SITE. WE DISCLAIM ALL WARRANTIES TO THE EXTENT PERMITTED BY LAW.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">7. Limitation of Liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, CAMPUSIYO AND ITS FOUNDERS SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO ACCESS THE PRE-LAUNCH WEBSITE OR WAITLIST REGISTRATIONS.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">8. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and interpreted in accordance with the laws of India, without regard to conflict of law rules.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">9. Contact Information</h2>
            <p>
              If you wish to review, update, or ask questions about these Terms, contact us:
              <br />
              <strong>Email:</strong> hello@campusiyo.in
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
