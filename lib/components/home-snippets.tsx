"use client";

const snippets = [
  {
    tag: "WRITING INTELLIGENCE",
    title: "Reusable Score-True Feedback",
    highlight: "IELTS",
    description:
      "Create exam-accurate writing reviews with clean band-level guidance, targeted mistakes, and improved sample responses in seconds.",
    src: "https://cdn.coverr.co/videos/coverr-typing-on-a-laptop-1579/1080p.mp4"
  },
  {
    tag: "SPEAKING FLOW",
    title: "Live Transcript + Speaking Eval",
    highlight: "TOEFL",
    description:
      "Run camera and microphone practice with real-time transcription, then convert spoken answers into a rubric-based speaking score card.",
    src: "https://cdn.coverr.co/videos/coverr-woman-working-on-laptop-1573/1080p.mp4"
  },
  {
    tag: "PROGRESS ENGINE",
    title: "One Dashboard for",
    highlight: "GRE + More",
    description:
      "Track attempts, section strengths, and score momentum in one focused prep cockpit built for faster exam readiness.",
    src: "https://cdn.coverr.co/videos/coverr-working-at-home-1572/1080p.mp4"
  }
] as const;

export function HomeSnippets() {
  return (
    <section className="snippet-showcase">
      <header className="snippet-head">
        <h2 className="section-title" style={{ fontSize: "2.2rem" }}>
          Advanced, design-true learning experience
        </h2>
        <div className="snippet-line" />
        <p className="muted snippet-intro">
          Preserve structure, speed, and exam focus with modules that adapt to writing, speaking, and
          listening goals without breaking your learning flow.
        </p>
      </header>

      <div className="snippet-stack">
        {snippets.map((snippet, idx) => (
          <article
            key={snippet.title}
            className={`snippet-row ${idx % 2 === 1 ? "reverse" : ""}`}
          >
            <div className="snippet-copy">
              <span className="snippet-tag">{snippet.tag}</span>
              <h3>
                {snippet.title} <span>{snippet.highlight}</span>
              </h3>
              <p>{snippet.description}</p>
            </div>

            <div className="snippet-media-shell">
              <video
                className="snippet-video"
                src={snippet.src}
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
