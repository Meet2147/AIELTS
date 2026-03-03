"use client";

import { useMemo, useState } from "react";
import type { SupportedExam, WritingRubric } from "@/lib/types";
import { ScoreCard } from "@/lib/components/score-card";

type PromptItem = { id: string; title: string; prompt: string };

export function WritingPractice({
  exam,
  section,
  prompts
}: {
  exam: SupportedExam;
  section: string;
  prompts: PromptItem[];
}) {
  const [selectedId, setSelectedId] = useState(prompts[0]?.id ?? "");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rubric, setRubric] = useState<WritingRubric | null>(null);

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === selectedId) ?? prompts[0],
    [prompts, selectedId]
  );

  async function submit() {
    setLoading(true);
    setError(null);
    setRubric(null);

    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exam,
        section,
        prompt: selectedPrompt.prompt,
        answer
      })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.success) {
      setError(data.error ?? "Scoring failed.");
      return;
    }

    setRubric(data.result);
  }

  return (
    <div className="grid" style={{ gap: "1rem" }}>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>
          {exam.toUpperCase()} - {section}
        </h1>

        <label className="muted" htmlFor="promptSelect">Prompt</label>
        <select
          id="promptSelect"
          className="select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {prompts.map((prompt) => (
            <option key={prompt.id} value={prompt.id}>{prompt.title}</option>
          ))}
        </select>

        <p className="card" style={{ marginTop: "0.8rem", whiteSpace: "pre-wrap" }}>{selectedPrompt.prompt}</p>

        <label className="muted" htmlFor="answerBox">Your Response</label>
        <textarea
          id="answerBox"
          className="textarea"
          placeholder="Write your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <div className="row between">
          <span className="muted">Word count: {answer.trim() ? answer.trim().split(/\s+/).length : 0}</span>
          <button className="button" onClick={submit} disabled={loading || answer.trim().length < 50}>
            {loading ? "Analyzing..." : "Get AI Feedback"}
          </button>
        </div>

        {error ? <p style={{ color: "#9c1c1c" }}>{error}</p> : null}
      </section>

      {rubric ? <ScoreCard rubric={rubric} /> : null}
    </div>
  );
}
