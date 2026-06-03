// ─────────────────────────────────────────────────────────────
// src/middleware.ts
// Route protection via NextAuth v5.
//
// Rules:
//   • /admin/login  — always public (sign-in page)
//   • /admin/*      — requires an authenticated session;
//                     unauthenticated requests redirect to /admin/login
//   • everything else — public, no restrictions
//
// The middleware runs on the Edge runtime (no Node.js APIs).
// ─────────────────────────────────────────────────────────────

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow the login page unconditionally
  if (pathname === "/admin/login") {
    // If already authenticated, redirect to dashboard
    if (req.auth) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Protect all other /admin routes
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      const loginUrl = new URL("/admin/login", req.url);
      // Preserve intended destination for post-login redirect
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

// ── Matcher ───────────────────────────────────────────────────
// Only run middleware on admin routes.
// Next.js internals, static assets, and API routes are excluded
// automatically because they don't match /admin/:path*.

export const config = {
  matcher: ["/admin/:path*"],
};
