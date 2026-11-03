import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  const isDashboard = nextUrl.pathname.startsWith("/dashboard");

  if (!isDashboard) {
    return NextResponse.next();
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (session.user.role === "ADMIN") {
    return NextResponse.next();
  }

  if (!session.user.hasSelectedPlan) {
    return NextResponse.redirect(new URL("/pricing?choose=1", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
