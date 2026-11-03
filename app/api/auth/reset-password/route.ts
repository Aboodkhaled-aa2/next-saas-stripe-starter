import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token, password: rawPassword } = await request.json();
    const password = String(rawPassword || "");
    const resetToken = String(token || "");
    if (!resetToken || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json({ error: "Use at least 8 characters, including uppercase, lowercase, a number, and a symbol." }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token: resetToken } });
    if (!record || record.expires <= new Date()) {
      if (record) await prisma.passwordResetToken.delete({ where: { id: record.id } });
      return NextResponse.json({ error: "This reset link is invalid or expired. Request a new one." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Unable to reset your password." }, { status: 500 });
  }
}
