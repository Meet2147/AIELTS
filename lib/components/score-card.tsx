import type { WritingRubric } from "@/lib/types";

export function ScoreCard({ rubric }: { rubric: WritingRubric }) {
  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>AI Score Card</h2>
      <p>
        <strong>Estimated Score:</strong> {rubric.estimated_band_or_score}
      </p>
      <p>
        <strong>Normalized Score:</strong> {rubric.overall_score}/100
      </p>

      <div className="grid" style={{ gap: "0.6rem" }}>
        {rubric.rubric_breakdown.map((item, idx) => (
          <div key={`${item.criterion}-${idx}`} className="card" style={{ padding: "0.7rem" }}>
            <strong>{item.criterion}</strong>: {item.score}
            <p className="muted" style={{ marginBottom: 0 }}>{item.feedback}</p>
          </div>
        ))}
      </div>

      <h3>Top 3 Mistakes</h3>
      <ul>
        {rubric.top_mistakes.map((mistake, idx) => (
          <li key={`${mistake}-${idx}`}>{mistake}</li>
        ))}
      </ul>

      <h3>Improved Sample</h3>
      <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{rubric.improved_sample}</p>

      <h3>Next Actions</h3>
      <ul>
        {rubric.next_actions.map((action, idx) => (
          <li key={`${action}-${idx}`}>{action}</li>
        ))}
      </ul>
    </section>
  );
}
