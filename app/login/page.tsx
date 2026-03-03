"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setMessage(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.success) {
      setMessage(data.error ?? "Authentication failed.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <p className="kicker">Welcome back</p>
      <h1 style={{ marginTop: 0 }}>{mode === "login" ? "Login" : "Create Account"}</h1>
      <p className="muted">Use email auth to access your saved attempts and AI score history.</p>

      <div className="grid" style={{ gap: "0.75rem" }}>
        <input
          className="input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Password (8+ chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="row" style={{ marginTop: "1rem" }}>
        <button className="button" disabled={loading} onClick={submit}>
          {loading ? "Working..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        <button
          className="button secondary"
          disabled={loading}
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Switch to Sign Up" : "Switch to Login"}
        </button>
      </div>

      {mode === "login" ? (
        <p style={{ marginTop: "0.8rem" }}>
          <Link href="/forgot-password" style={{ color: "#4d63ff" }}>Forgot password?</Link>
        </p>
      ) : null}

      {message ? <p style={{ marginTop: "0.8rem", color: "#d04b7b" }}>{message}</p> : null}
    </section>
  );
}
