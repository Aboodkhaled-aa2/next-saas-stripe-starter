import { NextResponse } from "next/server";

import { isDemoMode } from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { demoMode: isDemoMode },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
