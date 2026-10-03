import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    return NextResponse.json(
      {
        error,
        errorDescription,
      },
      { status: 400 },
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing OAuth code" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Instagram OAuth callback reached successfully",
    codeReceived: true,
  });
}
