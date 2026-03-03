import Link from "next/link";
import { HomeSnippets } from "@/lib/components/home-snippets";
import { TypeCycle } from "@/lib/components/type-cycle";

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero home-hero">
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <p className="kicker" style={{ margin: 0 }}>All-in-one AI exam prep</p>
          <Link className="button" href="/dashboard">Get Started</Link>
        </div>

        <h1 className="hero-title" style={{ marginTop: "0.4rem" }}>
          Master <TypeCycle /> with one modern prep app.
        </h1>

        <p className="hero-sub">
          Practice, get instant feedback, and track score growth across writing, speaking, and listening.
          Built for fast progress and demo-ready results.
        </p>

        <div className="badges" style={{ marginTop: "0.7rem" }}>
          <span className="badge">AI Rubric Scoring</span>
          <span className="badge">Live Speaking Transcription</span>
          <span className="badge">Pricing + Checkout</span>
          <span className="badge">Progress Dashboard</span>
        </div>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2 className="section-title" style={{ marginBottom: "0.4rem" }}>Features</h2>
        <div className="grid cols-3">
          <article className="card solid feature-tile">
            <h3>Smart Writing Coach</h3>
            <p className="muted">Instant exam-style feedback with actionable improvements.</p>
          </article>
          <article className="card solid feature-tile">
            <h3>Listening + Speaking</h3>
            <p className="muted">Audio prompts, live AV stream, and automatic transcription flow.</p>
          </article>
          <article className="card solid feature-tile">
            <h3>One Prep Command Center</h3>
            <p className="muted">Track attempts and jump across IELTS, TOEFL, GRE modules quickly.</p>
          </article>
        </div>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <HomeSnippets />
      </section>
    </div>
  );
}
