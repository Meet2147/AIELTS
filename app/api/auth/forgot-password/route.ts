import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/lib/auth";

const schema = z.object({
  email: z.string().email()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Enter a valid email." }, { status: 400 });
    }

    const { email } = parsed.data;
    const reqUrl = new URL(req.url);
    const baseUrl = process.env.APP_BASE_URL || reqUrl.origin;

    const resetLink = createPasswordResetToken(email, baseUrl);

    const payload: { success: true; message: string; reset_link?: string } = {
      success: true,
      message: "If an account exists, a password reset link has been generated."
    };

    // Demo helper: expose reset link outside production to test flow quickly.
    if (resetLink && process.env.NODE_ENV !== "production") {
      payload.reset_link = resetLink;
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Forgot password failed" },
      { status: 500 }
    );
  }
}
