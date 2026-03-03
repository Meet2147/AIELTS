import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="shell">
          <div className="nav-wrap">
            <div className="nav">
              <Link href="/" className="brand">ExamPrep AI</Link>
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
