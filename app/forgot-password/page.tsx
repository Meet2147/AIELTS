"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setMessage(null);
    setResetLink(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.success) {
      setMessage(data.error ?? "Could not start reset flow.");
      return;
    }

    setMessage(data.message);
    if (data.reset_link) setResetLink(data.reset_link);
  }

  return (
    <section className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
      <p className="kicker">Account Recovery</p>
      <h1 style={{ marginTop: 0 }}>Forgot Password</h1>
      <p className="muted">Enter your account email to generate a reset link.</p>

      <input
        className="input"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="row" style={{ marginTop: "0.8rem" }}>
        <button className="button" onClick={submit} disabled={loading || !email.trim()}>
          {loading ? "Generating..." : "Send Reset Link"}
        </button>
        <Link className="button secondary" href="/login">Back to Login</Link>
      </div>

      {message ? <p style={{ marginTop: "0.8rem" }}>{message}</p> : null}

      {resetLink ? (
        <p style={{ marginTop: "0.6rem" }}>
          Demo reset link: <a href={resetLink} style={{ color: "#4d63ff" }}>{resetLink}</a>
        </p>
      ) : null}
    </section>
  );
}
