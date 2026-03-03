"use client";

import { useMemo, useState } from "react";

type ListeningQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

const transcript = `Today, our lecture is about urban bike-sharing systems. In 2018, Greenford launched 120 bike stations with around 1,800 bicycles. At first, usage was modest, but after dedicated cycling lanes were introduced, daily rides increased by 35%. The city also reduced membership fees for students and office workers. However, several neighborhoods reported bike shortages during peak hours, especially between 8 and 10 AM. To address that, the transport office added real-time rebalancing vans and a mobile app that shows station availability. A recent survey found that 62% of users replaced at least one weekly car trip with bike travel.`;

const questions: ListeningQuestion[] = [
  {
    id: "q1",
    question: "How many bike stations were launched in Greenford in 2018?",
    options: ["120", "180", "350", "620"],
    correctIndex: 0
  },
  {
    id: "q2",
    question: "After cycling lanes were introduced, daily rides increased by:",
    options: ["15%", "25%", "35%", "45%"],
    correctIndex: 2
  },
  {
    id: "q3",
    question: "When were bike shortages most common?",
    options: ["6-8 AM", "8-10 AM", "12-2 PM", "6-8 PM"],
    correctIndex: 1
  },
  {
    id: "q4",
    question: "What share of users replaced at least one weekly car trip?",
    options: ["42%", "52%", "62%", "72%"],
    correctIndex: 2
  }
];

function estimateBand(score: number) {
  if (score >= 39) return "Band 9";
  if (score >= 37) return "Band 8.5";
  if (score >= 35) return "Band 8";
  if (score >= 32) return "Band 7.5";
  if (score >= 30) return "Band 7";
  if (score >= 26) return "Band 6.5";
  if (score >= 23) return "Band 6";
  if (score >= 18) return "Band 5.5";
  return "Band 5 or below";
}

export function ListeningPractice() {
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ raw: number; scaled: number; band: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  function playStreamedAudio() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Speech synthesis is not supported in this browser.");
      return;
    }

    setError(null);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => {
      setPlaying(false);
      setError("Could not play listening stream.");
    };
    window.speechSynthesis.speak(utterance);
  }

  function stopAudio() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    }
  }

  async function submitAnswers() {
    setError(null);
    const payload = {
      transcript,
      answers: questions.map((q) => ({ questionId: q.id, selectedIndex: answers[q.id] ?? -1 })),
      questions: questions.map((q) => ({ id: q.id, correctIndex: q.correctIndex }))
    };

    const res = await fetch("/api/score-listening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.error ?? "Failed to score listening attempt.");
      return;
    }

    setResult({
      raw: data.result.raw_score,
      scaled: data.result.scaled_score,
      band: estimateBand(data.result.scaled_score)
    });
  }

  return (
    <div className="grid" style={{ gap: "1rem" }}>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>IELTS Listening</h1>
        <p className="muted">Stream the passage audio, then answer the questions below.</p>

        <div className="row">
          <button className="button" onClick={playStreamedAudio} disabled={playing}>
            {playing ? "Playing..." : "Start Audio Stream"}
          </button>
          <button className="button secondary" onClick={stopAudio} disabled={!playing}>
            Stop
          </button>
          <span className="muted">Answered: {answeredCount}/{questions.length}</span>
        </div>

        {error ? <p style={{ color: "#9c1c1c" }}>{error}</p> : null}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Questions</h2>
        <div className="grid" style={{ gap: "0.8rem" }}>
          {questions.map((q) => (
            <div key={q.id} className="card" style={{ padding: "0.8rem" }}>
              <p style={{ marginTop: 0 }}><strong>{q.question}</strong></p>
              <div className="grid" style={{ gap: "0.4rem" }}>
                {q.options.map((option, idx) => (
                  <label key={`${q.id}-${idx}`} className="row" style={{ alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === idx}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="button" style={{ marginTop: "0.8rem" }} onClick={submitAnswers}>
          Submit Listening Test
        </button>
      </section>

      {result ? (
        <section className="card">
          <h2 style={{ marginTop: 0 }}>Listening Score</h2>
          <p><strong>Raw:</strong> {result.raw}/{questions.length}</p>
          <p><strong>Scaled (40):</strong> {result.scaled}/40</p>
          <p><strong>Estimated Band:</strong> {result.band}</p>
        </section>
      ) : null}
    </div>
  );
}
