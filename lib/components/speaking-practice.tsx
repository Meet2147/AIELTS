"use client";

import { useEffect, useRef, useState } from "react";
import { ScoreCard } from "@/lib/components/score-card";
import type { WritingRubric } from "@/lib/types";

type SpeechRecognitionAlternative = { transcript: string };
type SpeechRecognitionResult = {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
};
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResult[];
};
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const prompts = [
  "Describe a skill you learned recently. Why did you learn it and how has it helped you?",
  "Describe a place in your city that you enjoy visiting. Explain what makes it interesting.",
  "Some people believe success depends mostly on hard work, others on luck. Discuss both views and give your opinion."
];

export function SpeakingPractice() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [liveText, setLiveText] = useState("");
  const [rubric, setRubric] = useState<WritingRubric | null>(null);
  const [loading, setLoading] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const speechWindow = window as WindowWithSpeech;
    if (!speechWindow.SpeechRecognition && !speechWindow.webkitSpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  async function startStream() {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreaming(true);
    } catch {
      setError("Camera/microphone access failed. Please allow permissions.");
    }
  }

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    stopTranscription();
    setStreaming(false);
    setRecording(false);
  }

  function startRecording() {
    if (!streamRef.current) {
      setError("Start stream first.");
      return;
    }

    chunksRef.current = [];
    setRecordedUrl(null);
    setError(null);

    const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedUrl(URL.createObjectURL(blob));
      setRecording(false);
    };

    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  function startTranscription() {
    if (!speechSupported) {
      setError("Live transcription is not supported in this browser. Use Chrome/Edge.");
      return;
    }

    const speechWindow = window as WindowWithSpeech;
    const SpeechRecognitionCtor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setError("Live transcription is unavailable.");
      return;
    }

    setError(null);
    setLiveText("");

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          setTranscript((prev) => `${prev}${prev.trim().length ? " " : ""}${text.trim()}`.trim());
        } else {
          interim += text;
        }
      }
      setLiveText(interim.trim());
    };

    recognition.onerror = (event) => {
      setError(`Transcription error: ${event.error}`);
      setTranscribing(false);
    };

    recognition.onend = () => {
      setTranscribing(false);
      setLiveText("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setTranscribing(true);
  }

  function stopTranscription() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setTranscribing(false);
    setLiveText("");
  }

  async function evaluateSpeaking() {
    setLoading(true);
    setError(null);
    setRubric(null);

    const res = await fetch("/api/score-speaking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompts[promptIndex],
        transcript
      })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.success) {
      setError(data.error ?? "Failed to evaluate speaking response.");
      return;
    }

    setRubric(data.result);
  }

  return (
    <div className="grid" style={{ gap: "1rem" }}>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>IELTS Speaking</h1>
        <p className="muted">Live video/audio stream is enabled through your browser camera + microphone.</p>

        <label className="muted" htmlFor="sPrompt">Prompt</label>
        <select
          id="sPrompt"
          className="select"
          value={promptIndex}
          onChange={(e) => setPromptIndex(Number(e.target.value))}
        >
          {prompts.map((prompt, idx) => (
            <option key={prompt} value={idx}>Prompt {idx + 1}</option>
          ))}
        </select>

        <p className="card" style={{ marginTop: "0.7rem" }}>{prompts[promptIndex]}</p>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--border)" }}
        />

        <div className="row" style={{ marginTop: "0.7rem" }}>
          <button className="button" onClick={startStream} disabled={streaming}>Start AV Stream</button>
          <button className="button secondary" onClick={stopStream} disabled={!streaming}>Stop Stream</button>
          <button className="button" onClick={startRecording} disabled={!streaming || recording}>Start Recording</button>
          <button className="button secondary" onClick={stopRecording} disabled={!recording}>Stop Recording</button>
        </div>

        <div className="row" style={{ marginTop: "0.7rem" }}>
          <button className="button" onClick={startTranscription} disabled={transcribing || !speechSupported}>
            {transcribing ? "Transcribing..." : "Start Transcription"}
          </button>
          <button className="button secondary" onClick={stopTranscription} disabled={!transcribing}>
            Stop Transcription
          </button>
          <span className="muted">
            {speechSupported ? "Use Chrome/Edge for best results." : "Live transcription unsupported in this browser."}
          </span>
        </div>

        {recordedUrl ? (
          <div style={{ marginTop: "0.8rem" }}>
            <p className="muted">Recorded sample preview:</p>
            <video controls src={recordedUrl} style={{ width: "100%", borderRadius: "12px" }} />
          </div>
        ) : null}

        <label className="muted" htmlFor="transcript" style={{ marginTop: "0.8rem", display: "block" }}>
          Speaking transcript
        </label>
        <textarea
          id="transcript"
          className="textarea"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Transcript appears here while transcribing."
        />
        {liveText ? <p className="muted">Live: {liveText}</p> : null}

        <button className="button" onClick={evaluateSpeaking} disabled={loading || transcript.trim().length < 40}>
          {loading ? "Evaluating..." : "Get Speaking Score"}
        </button>

        {error ? <p style={{ color: "#ff9eb2" }}>{error}</p> : null}
      </section>

      {rubric ? <ScoreCard rubric={rubric} /> : null}
    </div>
  );
}
