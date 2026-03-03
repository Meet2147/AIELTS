import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/lib/components/logout-button";
import { examCards } from "@/lib/exams";
import { getDb } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();

  const attempts = db
    .prepare(
      "select exam, section, ai_score, created_at from exam_attempts where user_id = ? order by created_at desc limit 10"
    )
    .all(user.id) as { exam: string; section: string; ai_score: number | null; created_at: string }[];

  return (
    <div className="grid" style={{ gap: "1rem" }}>
      <section className="hero">
        <p className="kicker">Your prep cockpit</p>
        <div className="row between">
          <h1 className="hero-title" style={{ fontSize: "2rem" }}>Choose Your Exam</h1>
          <LogoutButton />
        </div>
        <p className="muted">Signed in as {user.email}</p>
        <div className="row">
          <Link className="button" href="/pricing">Upgrade Plan</Link>
          <Link className="button secondary" href="/practice/ielts">Open IELTS Suite</Link>
        </div>
      </section>

      <section className="grid cols-3">
        {examCards.map((card) => (
          <article key={card.title} className="card solid" style={{ padding: "1rem" }}>
            <h3 style={{ marginTop: 0 }}>{card.title}</h3>
            <p className="muted">{card.description}</p>
            <Link className="button" href={card.href}>
              {card.exam === "gre" ? "Soon" : "Start"}
            </Link>
          </article>
        ))}
      </section>

      <section className="card">
        <h2 className="section-title">Recent Attempts</h2>
        {!attempts.length ? (
          <p className="muted">No attempts yet. Complete a module to populate your performance feed.</p>
        ) : (
          <div className="grid" style={{ gap: "0.55rem" }}>
            {attempts.map((attempt, idx) => (
              <div key={`${attempt.created_at}-${idx}`} className="row between card solid" style={{ padding: "0.8rem" }}>
                <span>
                  {String(attempt.exam).toUpperCase()} - {attempt.section}
                </span>
                <span className="muted">Score: {attempt.ai_score ?? "-"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
