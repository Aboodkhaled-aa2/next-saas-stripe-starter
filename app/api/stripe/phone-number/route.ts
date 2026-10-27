import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        "Separate phone-number checkout is disabled. Eligible subscriptions receive a reception number automatically.",
    },
    { status: 410 },
  );
}
