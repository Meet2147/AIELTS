"use client";

const snippets = [
  {
    title: "Writing AI Score Card",
    description: "Band-style breakdown, mistakes, and better rewrite in seconds.",
    src: "https://cdn.coverr.co/videos/coverr-typing-on-a-laptop-1579/1080p.mp4"
  },
  {
    title: "Speaking Practice",
    description: "Live AV stream, transcription, and speaking rubric feedback.",
    src: "https://cdn.coverr.co/videos/coverr-woman-working-on-laptop-1573/1080p.mp4"
  },
  {
    title: "Dashboard Progress",
    description: "Recent attempts, section strengths, and score momentum.",
    src: "https://cdn.coverr.co/videos/coverr-working-at-home-1572/1080p.mp4"
  }
] as const;

export function HomeSnippets() {
  return (
    <section className="snippets-wrap">
      {snippets.map((snippet) => (
        <article key={snippet.title} className="snippet-card">
          <div className="snippet-meta">
            <h3>{snippet.title}</h3>
            <p>{snippet.description}</p>
          </div>
          <video
            className="snippet-video"
            src={snippet.src}
            autoPlay
            muted
            loop
            playsInline
            controls
          />
        </article>
      ))}
    </section>
  );
}
