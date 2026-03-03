"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type PlanMeta = {
  label: string;
  price: string;
  cadence: string;
};

const planMap: Record<string, PlanMeta> = {
  monthly: { label: "Monthly", price: "$29", cadence: "per month" },
  yearly: { label: "Yearly", price: "$99", cadence: "per year" },
  lifetime: { label: "Lifetime", price: "$299", cadence: "one-time" }
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedPlan = useMemo(() => {
    const key = searchParams.get("plan") || "monthly";
    return planMap[key] ?? planMap.monthly;
  }, [searchParams]);

  async function payNow() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <section className="card pop" style={{ maxWidth: 640, margin: "0 auto" }}>
        <p className="kicker">Payment Success</p>
        <h1 style={{ marginTop: 0 }}>You are on the {selectedPlan.label} plan</h1>
        <p className="muted">
          Receipt and subscription details are shown here for demo. Next step is plugging Stripe/Razorpay checkout.
        </p>
        <div className="row">
          <Link className="button" href="/dashboard">Go to Dashboard</Link>
          <Link className="button secondary" href="/practice/ielts">Start IELTS Practice</Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid" style={{ gap: "1rem" }}>
      <section className="hero">
        <p className="kicker">Payment</p>
        <h1 className="hero-title" style={{ fontSize: "2rem" }}>{selectedPlan.label} Subscription</h1>
        <p className="hero-sub">
          {selectedPlan.price} {selectedPlan.cadence}
        </p>
      </section>

      <section className="card" style={{ maxWidth: 700 }}>
        <h2 style={{ marginTop: 0 }}>Checkout Details</h2>
        <div className="grid" style={{ gap: "0.7rem" }}>
          <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input"
            placeholder="Card number (demo)"
            value={card}
            onChange={(e) => setCard(e.target.value)}
          />
        </div>
        <div className="row" style={{ marginTop: "0.8rem" }}>
          <button
            className="button"
            onClick={payNow}
            disabled={loading || !name.trim() || !email.trim() || card.trim().length < 8}
          >
            {loading ? "Processing..." : `Pay ${selectedPlan.price}`}
          </button>
          <Link className="button secondary" href="/pricing">Back to Plans</Link>
        </div>
      </section>
    </div>
  );
}
