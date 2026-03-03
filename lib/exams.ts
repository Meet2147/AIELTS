import type { SupportedExam } from "@/lib/types";

export const examCards: { exam: SupportedExam; title: string; description: string; href: string }[] = [
  {
    exam: "ielts",
    title: "IELTS Practice Suite",
    description: "Writing, Listening, and Speaking in one place.",
    href: "/practice/ielts"
  },
  {
    exam: "toefl",
    title: "TOEFL Writing",
    description: "Integrated/independent style writing feedback.",
    href: "/practice/toefl-writing"
  },
  {
    exam: "gre",
    title: "GRE (Coming next)",
    description: "Issue essay + Verbal/Quant mini tests planned next.",
    href: "/dashboard"
  }
];
