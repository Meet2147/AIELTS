import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

const schema = z.object({
  exam: z.enum(["ielts", "toefl", "gre"]),
  section: z.string().min(2),
  prompt: z.string().min(10),
  answer: z.string().min(50)
});

const outputFormat = `Return ONLY valid compact JSON with this schema:
{
  "overall_score": number,
  "estimated_band_or_score": string,
  "rubric_breakdown": [
    {"criterion": string, "score": string, "feedback": string}
  ],
  "top_mistakes": [string, string, string],
  "improved_sample": string,
  "next_actions": [string, string, string]
}`;

function buildPrompt(exam: "ielts" | "toefl" | "gre", section: string, prompt: string, answer: string) {
  return `You are an expert ${exam.toUpperCase()} coach.
Task section: ${section}
Prompt: ${prompt}
Student answer: ${answer}

Evaluate strictly with ${exam.toUpperCase()}-style writing rubric.
- Give concise, practical feedback.
- Keep improved sample under 180 words.
${outputFormat}`;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
    }

    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { success: false, error: "PERPLEXITY_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const { exam, section, prompt, answer } = parsed.data;

    const sonarRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a strict but constructive exam writing evaluator. Reply with JSON only, no markdown."
          },
          {
            role: "user",
            content: buildPrompt(exam, section, prompt, answer)
          }
        ]
      })
    });

    if (!sonarRes.ok) {
      const errorText = await sonarRes.text();
      return NextResponse.json(
        { success: false, error: `Sonar request failed: ${errorText}` },
        { status: 502 }
      );
    }

    const sonarJson = await sonarRes.json();
    const rawContent = sonarJson?.choices?.[0]?.message?.content;

    if (!rawContent || typeof rawContent !== "string") {
      return NextResponse.json(
        { success: false, error: "Sonar response format was unexpected." },
        { status: 502 }
      );
    }

    let result;
    try {
      result = JSON.parse(rawContent);
    } catch {
      const extracted = rawContent.match(/\{[\s\S]*\}/)?.[0];
      if (!extracted) {
        return NextResponse.json(
          { success: false, error: "Could not parse model JSON response." },
          { status: 502 }
        );
      }
      result = JSON.parse(extracted);
    }

    const db = getDb();
    db.prepare(
      `insert into exam_attempts
       (id, user_id, exam, section, prompt, answer, ai_score, feedback_json, created_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      randomUUID(),
      user.id,
      exam,
      section,
      prompt,
      answer,
      result.overall_score ?? null,
      JSON.stringify(result),
      new Date().toISOString()
    );

    return NextResponse.json({ success: true, exam, section, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
