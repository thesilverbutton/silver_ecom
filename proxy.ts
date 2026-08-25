import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Proxy (replaces middleware in Next.js 16).
 * Handles auth gates for /account/* and /admin/*.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isHttps = request.nextUrl.protocol === "https:";

  // Try standard getToken with protocol-aware secureCookie flag
  let token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: isHttps,
  });

  // Fallback if secureCookie flag is inverted or in mixed dev/prod environment
  if (!token) {
    token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: !isHttps,
    });
  }

  // Fallback by checking present cookie names directly
  if (!token) {
    const rawCookieName =
      request.cookies.get("__Secure-authjs.session-token") ? "__Secure-authjs.session-token"
      : request.cookies.get("authjs.session-token") ? "authjs.session-token"
      : request.cookies.get("__Secure-next-auth.session-token") ? "__Secure-next-auth.session-token"
      : request.cookies.get("next-auth.session-token") ? "next-auth.session-token"
      : null;

    if (rawCookieName) {
      token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        cookieName: rawCookieName,
        salt: rawCookieName,
      });
    }
  }

  // Protect /account/* — require any authenticated user
  if (pathname.startsWith("/account")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /admin/* — require admin/staff role
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin-login")) {
    if (!token || !["admin", "staff"].includes(token.role as string)) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
