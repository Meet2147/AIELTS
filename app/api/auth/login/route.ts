import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, findUserByEmail, setSessionCookie, verifyPassword } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid login payload." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = findUserByEmail(email);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
    }

    const session = createSession(user.id);
    await setSessionCookie(session.token, session.expiresAt);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    );
  }
}
