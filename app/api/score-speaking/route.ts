import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

const schema = z.object({
  prompt: z.string().min(10),
  transcript: z.string().min(40)
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

function buildPrompt(prompt: string, transcript: string) {
  return `You are an IELTS Speaking examiner.
Part prompt: ${prompt}
Candidate transcript: ${transcript}

Evaluate by IELTS Speaking rubric:
- Fluency and Coherence
- Lexical Resource
- Grammatical Range and Accuracy
- Pronunciation (infer from transcript clarity and phrasing limits)

Give concise, practical feedback and keep improved sample under 120 words.
${outputFormat}`;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { success: false, error: "PERPLEXITY_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
    }

    const { prompt, transcript } = parsed.data;

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
              "You are a strict but constructive IELTS speaking evaluator. Reply with JSON only, no markdown."
          },
          {
            role: "user",
            content: buildPrompt(prompt, transcript)
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
      "ielts",
      "Speaking",
      prompt,
      transcript,
      result.overall_score ?? null,
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
