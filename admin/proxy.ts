import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const isLoginRoute = request.nextUrl.pathname === "/login";

  if (!hasSession && !isLoginRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && isLoginRoute) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/usuarios/:path*",
    "/versoes-aplicativo/:path*",
    "/login",
  ],
};
