import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

const schema = z.object({
  transcript: z.string().min(20),
  questions: z.array(z.object({ id: z.string(), correctIndex: z.number().int().min(0) })).min(1),
  answers: z.array(z.object({ questionId: z.string(), selectedIndex: z.number().int() })).min(1)
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
    }

    const { transcript, questions, answers } = parsed.data;
    const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));

    const rawCorrect = questions.reduce((acc, q) => {
      return answerMap.get(q.id) === q.correctIndex ? acc + 1 : acc;
    }, 0);

    const scaledScore = Math.round((rawCorrect / questions.length) * 40);

    const result = {
      raw_score: rawCorrect,
      total_questions: questions.length,
      scaled_score: scaledScore,
      feedback:
        scaledScore >= 30
          ? "Strong listening performance. Focus on detail retention for peak-band consistency."
          : "Improve note-taking and keyword tracking while listening."
    };

    const db = getDb();
    db.prepare(
      `insert into exam_attempts
       (id, user_id, exam, section, prompt, answer, ai_score, feedback_json, created_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      randomUUID(),
      user.id,
      "ielts",
      "Listening",
      "IELTS Listening Stream Prompt",
      JSON.stringify({ answers }),
      scaledScore,
      JSON.stringify(result),
      new Date().toISOString()
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
