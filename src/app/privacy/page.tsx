import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the Privacy Policy of Campusiyo to understand how we collect, store, and safeguard your waitlist and contact information.",
};

export default function Privacy() {
  return (
    <>
      <Navbar />

      <main className="flex-grow bg-background py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white border border-border-light rounded-2xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-foreground border-b border-border-light pb-6">
            Privacy Policy
          </h1>
          <p className="text-xs text-secondary-gray mt-2">
            Last Updated: July 20, 2026
          </p>

          <div className="mt-8 space-y-6 text-sm sm:text-base text-secondary-gray leading-relaxed">
            <p>
              Welcome to Campusiyo. We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy describes how we collect, use, and process your information when you visit our pre-launch website.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">1. Information We Collect</h2>
            <p>
              Because Campusiyo is currently in its pre-launch phase, our data collection is extremely limited. We only collect details that you voluntarily submit to us:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-4">
              <li>
                <strong>Waitlist Information:</strong> Your email address when you sign up to join the Campusiyo waitlist.
              </li>
              <li>
                <strong>Contact Details:</strong> Your name, email address, university name, and message content when you use our contact form.
              </li>
              <li>
                <strong>Analytical Data:</strong> Basic usage details like IP addresses, browser types, and referring pages to understand web traffic and fix performance errors.
              </li>
            </ul>

            <h2 className="text-lg font-bold text-foreground mt-8">2. How We Use Your Information</h2>
            <p>
              We process your data purely to achieve our pre-launch startup goals:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-4">
              <li>To maintain and update our early-access waitlist.</li>
              <li>To notify you about the release of study notes matching your university syllabus.</li>
              <li>To respond to your inquiries, feature requests, or notes contribution questions.</li>
              <li>To monitor and optimize website loading speeds and responsiveness.</li>
            </ul>

            <h2 className="text-lg font-bold text-foreground mt-8">3. Cookies & Tracking</h2>
            <p>
              We may use tiny files called cookies or basic browser local storage (like saving your waitlist signup status) to improve your experience and prevent duplicate submissions. You can configure your browser to reject cookies, though some pre-launch features may not function correctly.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">4. Data Sharing and Transfer</h2>
            <p>
              Campusiyo does not sell, rent, or lease your email address or personal contact details to third-party advertisers. We may only share information with trusted hosting platforms or email services who assist us in managing the website, provided they agree to keep your information confidential.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">5. Data Security</h2>
            <p>
              We execute standard security protocols to safeguard your email database from unauthorized access, modification, or exposure. However, no internet transmission method is 100% secure, and we cannot guarantee complete security.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">6. Third-Party Links</h2>
            <p>
              Our website may link to social media profiles or reference university pages. We have no control over the privacy policies of external sites and encourage you to review their terms.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">7. Your Choices & Rights</h2>
            <p>
              You can ask us to delete your email from our pre-launch waitlist database at any time. Simply send an email containing your request to <a href="mailto:hello@campusiyo.in" className="text-primary hover:underline">hello@campusiyo.in</a>.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">8. Changes to This Policy</h2>
            <p>
              We will occasionally update this policy to align with new legal requirements or platform updates. Any updates will be published on this page with an updated timestamp.
            </p>

            <h2 className="text-lg font-bold text-foreground mt-8">9. Contact Information</h2>
            <p>
              If you have any questions or feedback regarding this privacy document, contact us at:
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
