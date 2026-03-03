"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit() {
    if (!token) {
      setMessage("Missing reset token in URL.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.success) {
      setMessage(data.error ?? "Could not reset password.");
      return;
    }

    setSuccess(true);
    setMessage(data.message ?? "Password reset successful.");
  }

  return (
    <section className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
      <p className="kicker">Account Recovery</p>
      <h1 style={{ marginTop: 0 }}>Reset Password</h1>
      <p className="muted">Set a new password for your account.</p>

      <div className="grid" style={{ gap: "0.7rem" }}>
        <input
          className="input"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="row" style={{ marginTop: "0.8rem" }}>
        <button className="button" onClick={submit} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        <Link className="button secondary" href="/login">Back to Login</Link>
      </div>

      {message ? (
        <p style={{ marginTop: "0.8rem", color: success ? "#3c4fb3" : "#d04b7b" }}>{message}</p>
      ) : null}
    </section>
  );
}
