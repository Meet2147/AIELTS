"use client";

import { useEffect, useState } from "react";

const words = ["IELTS", "GRE", "TOEFL"];

export function TypeCycle() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const doneTyping = displayed === current;
    const doneDeleting = displayed === "";

    const speed = deleting ? 55 : 95;
    const pause = doneTyping ? 900 : 0;

    const timer = setTimeout(() => {
      if (!deleting) {
        if (!doneTyping) {
          setDisplayed(current.slice(0, displayed.length + 1));
        } else {
          setDeleting(true);
        }
      } else if (!doneDeleting) {
        setDisplayed(current.slice(0, displayed.length - 1));
      } else {
        setDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }, speed + pause);

    return () => clearTimeout(timer);
  }, [deleting, displayed, wordIndex]);

  return (
    <span className="typed-wrap" aria-live="polite">
      <span className="typed-word">{displayed}</span>
      <span className="typed-caret">|</span>
    </span>
  );
}
