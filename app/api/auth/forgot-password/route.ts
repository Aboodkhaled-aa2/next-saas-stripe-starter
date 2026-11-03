import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resend } from "@/lib/email";
import { PasswordResetEmail } from "@/emails/password-reset-email";
import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

export async function POST(request: Request) {
  try {
    const { email: rawEmail } = await request.json();
    const email = String(rawEmail || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Return the same response whether the account exists or not.
    if (user) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 30 * 60 * 1000);
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.passwordResetToken.create({ data: { userId: user.id, token, expires } });
      const origin = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://www.smartcleaningdesk.com";
      const resetUrl = new URL("/reset-password", origin);
      resetUrl.searchParams.set("token", token);
      const { error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: email,
        subject: `Reset your ${siteConfig.name} password`,
        react: PasswordResetEmail({ firstName: user.name?.split(" ")[0] || "there", resetUrl: resetUrl.toString(), siteName: siteConfig.name }),
      });
      if (error) throw new Error(error.message);
    }
    return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Unable to send a reset link right now." }, { status: 500 });
  }
}
