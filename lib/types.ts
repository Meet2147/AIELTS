export type SupportedExam = "ielts" | "toefl" | "gre";

export type WritingRubric = {
  overall_score: number;
  estimated_band_or_score: string;
  rubric_breakdown: {
    criterion: string;
    score: string;
    feedback: string;
  }[];
  top_mistakes: string[];
  improved_sample: string;
  next_actions: string[];
};

export type ScoreResponse = {
  success: true;
  exam: SupportedExam;
  section: string;
  result: WritingRubric;
} | {
  success: false;
  error: string;
};
