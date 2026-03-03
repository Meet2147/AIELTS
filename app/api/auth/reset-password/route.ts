import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Token and new password (8+ chars) are required." },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const result = resetPasswordWithToken(token, password);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Password reset successful. Please log in." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Reset password failed" },
      { status: 500 }
    );
  }
}
