import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").toLowerCase().trim();
    const code = String(body.code || "").trim();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Please enter the 6-digit verification code." },
        { status: 400 },
      );
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 400 },
      );
    }

    const now = new Date();

    if (verificationToken.expires < now) {
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: email,
          token: code,
        },
      });

      return NextResponse.json(
        { error: "This verification code has expired." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 },
      );
    }

    // Keep the valid code briefly so Auth.js can consume it once to sign in
    // immediately after verification. The credentials provider deletes it atomically.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.json(
      { error: "Unable to verify your email. Please try again." },
      { status: 500 },
    );
  }
}
