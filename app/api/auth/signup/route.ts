import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, createUser, findUserByEmail, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Use a valid email and password (8+ chars)." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: "User already exists." }, { status: 409 });
    }

    const user = createUser(email, password);
    const session = createSession(user.id);
    await setSessionCookie(session.token, session.expiresAt);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Signup failed" },
      { status: 500 }
    );
  }
}
