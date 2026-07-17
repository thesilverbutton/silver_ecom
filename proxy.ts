import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Proxy (replaces middleware in Next.js 16).
 * Handles auth gates for /account/* and /admin/*.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // Protect /account/* — require any authenticated user
  if (pathname.startsWith("/account")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /admin/* (except /admin/login) — require admin/staff role
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!token || !["admin", "staff"].includes(token.role as string)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
