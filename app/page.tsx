import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid" style={{ gap: "1.2rem" }}>
      <section className="hero">
        <p className="kicker">All-in-one AI exam prep</p>
        <h1 className="hero-title">Crack IELTS, TOEFL, and GRE with instant, rubric-based feedback.</h1>
        <p className="hero-sub">
          Practice writing, listening, and speaking with Sonar-powered scoring, clear weak-area insights,
          and a dashboard that feels like a learning game, not a boring test portal.
        </p>
        <div className="badges" style={{ marginBottom: "0.8rem" }}>
          <span className="badge">Live Speaking AV Stream</span>
          <span className="badge">IELTS Listening Module</span>
          <span className="badge">AI Rubric Feedback</span>
          <span className="badge">Progress Tracker</span>
        </div>
        <div className="row">
          <Link className="button" href="/dashboard">Start Practicing</Link>
          <Link className="button secondary" href="/pricing">View Plans</Link>
        </div>
      </section>

      <section className="grid cols-3">
        <article className="card solid">
          <h3 style={{ marginTop: 0 }}>Daily Momentum</h3>
          <p className="muted">Short focused practice blocks with immediate scoring to keep streaks alive.</p>
        </article>
        <article className="card solid">
          <h3 style={{ marginTop: 0 }}>Exam-Accurate Rubrics</h3>
          <p className="muted">Feedback is structured by official section expectations and score bands.</p>
        </article>
        <article className="card solid">
          <h3 style={{ marginTop: 0 }}>Demo-Ready Dashboard</h3>
          <p className="muted">Clean UI with recent attempts and section-level score summaries.</p>
        </article>
      </section>
    </div>
  );
}
