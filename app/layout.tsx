import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Coachly | AI Prep for IELTS, TOEFL, GRE",
  description: "Coachly helps learners prep for IELTS, TOEFL, and GRE with AI-powered writing, speaking, and listening practice.",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="shell">
          <div className="nav-wrap">
            <div className="nav">
              <Link href="/" className="brand brand-row" aria-label="Coachly Home">
                <img src="/coachly-logo.svg" alt="Coachly" className="brand-logo" />
              </Link>
              <div className="nav-links">
                <Link href="/dashboard" className="nav-link">Dashboard</Link>
                <Link href="/pricing" className="nav-link">Pricing</Link>
                <Link href="/login" className="nav-link">Login</Link>
              </div>
            </div>
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
