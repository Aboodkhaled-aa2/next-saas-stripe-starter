import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { sendVerificationCode } from "@/lib/email";

const validPlans = ["starter", "business", "pro"] as const;

type Plan = (typeof validPlans)[number];

const planMap = {
  starter: "STARTER",
  business: "BUSINESS",
  pro: "PRO",
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const plan = String(body.plan || "starter").toLowerCase();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!validPlans.includes(plan as Plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must include at least one uppercase letter." },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must include at least one lowercase letter." },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must include at least one number." },
        { status: 400 }
      );
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must include at least one special character." },
        { status: 400 }
      );
    }

    const selectedPlan = planMap[plan as Plan];

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser?.emailVerified) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let user;

    if (existingUser) {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          passwordHash,
          plan: selectedPlan,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          plan: selectedPlan,
        },
      });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendVerificationCode({
      email,
      firstName: name.split(" ")[0] || name,
      verificationCode,
    });

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
      userId: user.id,
      plan,
    });
  } catch (error) {
    console.error("Registration error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create your account.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
