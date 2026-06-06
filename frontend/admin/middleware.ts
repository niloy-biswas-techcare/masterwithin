import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE_NAME ?? "mw_session";

/**
 * Edge middleware (§17.3): cheap UX bounce — not the security boundary.
 * Any route except /login without a session cookie redirects to /login.
 * The real auth check happens in layout.tsx via verifySession().
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and internal Next.js routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  if (!sessionCookie?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
