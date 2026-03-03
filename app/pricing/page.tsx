import Link from "next/link";

const plans = [
  {
    key: "monthly",
    name: "Monthly",
    price: "$29",
    billing: "per month",
    cta: "Start Monthly",
    tone: "secondary",
    features: [
      "Full IELTS Writing + Listening + Speaking",
      "TOEFL Writing and score cards",
      "Unlimited AI rubric evaluations",
      "Progress dashboard and attempt history"
    ]
  },
  {
    key: "yearly",
    name: "Yearly",
    price: "$99",
    billing: "per year",
    cta: "Get Yearly",
    tone: "pop",
    badge: "Best Value",
    features: [
      "Everything in Monthly",
      "Priority AI response queue",
      "Early access to GRE modules",
      "Advanced analytics insights"
    ]
  },
  {
    key: "lifetime",
    name: "Lifetime",
    price: "$299",
    billing: "one-time",
    cta: "Own It Forever",
    tone: "warn",
    features: [
      "Lifetime access to all current modules",
      "All future IELTS/TOEFL/GRE upgrades",
      "Premium speaking practice updates",
      "Priority support"
    ]
  }
] as const;

export default function PricingPage() {
  return (
    <div className="grid" style={{ gap: "1rem" }}>
      <section className="hero">
        <p className="kicker">Subscriptions</p>
        <h1 className="hero-title" style={{ fontSize: "2.2rem" }}>Pick your prep plan</h1>
        <p className="hero-sub">
          Flexible pricing for fast exam outcomes. Start with monthly, save with yearly, or go lifetime.
        </p>
      </section>

      <section className="grid cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className={`card ${plan.tone === "pop" ? "pop" : "solid"}`}>
            {"badge" in plan ? <p className="kicker" style={{ marginTop: 0 }}>{plan.badge}</p> : null}
            <h2 style={{ marginTop: 0, marginBottom: "0.2rem" }}>{plan.name}</h2>
            <p className="price">{plan.price}</p>
            <p className="muted" style={{ marginTop: 0 }}>{plan.billing}</p>

            <ul className="plan-list">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            <Link
              href={`/checkout?plan=${plan.key}`}
              className={`button ${plan.tone === "warn" ? "warn" : plan.tone === "secondary" ? "secondary" : ""}`}
              style={{ marginTop: "0.8rem", width: "100%", display: "inline-block", textAlign: "center" }}
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Checkout Integration</h3>
        <p className="muted" style={{ marginBottom: "0.8rem" }}>
          Demo checkout is active. Production step: connect Stripe or Razorpay payment intents and webhook events.
        </p>
        <div className="row">
          <Link href="/dashboard" className="button secondary">Back to Dashboard</Link>
          <Link href="/login" className="button">Open Account</Link>
        </div>
      </section>
    </div>
  );
}
