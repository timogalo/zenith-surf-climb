import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin/session";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (functionality
// unchanged) — see node_modules/next/dist/docs/01-app/02-guides/
// upgrading/version-16.md. Proxy runs on the Node.js runtime in this
// version (not Edge), so verifyAdminSessionToken's node:crypto HMAC
// check can run directly here, no Edge-compatible crypto shim needed.
//
// This is the "optimistic" outer gate the Next.js authentication guide
// recommends (docs/app/guides/authentication#optimistic-checks-with-proxy-optional).
// It is never the only check: every admin Server Component/Server Action
// also independently calls requireAdminSession() (src/lib/admin/dal.ts).

const LOGIN_PATH = "/admin/login";
const ADMIN_HOME_PATH = "/admin";

function hasValidSession(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }
  try {
    return verifyAdminSessionToken(token).ok;
  } catch (err) {
    // A misconfigured ADMIN_SESSION_SECRET must fail closed (treated as
    // "not authenticated"), never crash the request or leak the error.
    console.error("[proxy] admin session verification unavailable:", err);
    return false;
  }
}

export function proxy(request: NextRequest) {
  // Every admin mutation (login, logout, approve/reject, availability
  // toggles, change-password) is a Server Action — a POST to the
  // CURRENT page's own URL, including POST /admin/login for the login
  // form itself. If Proxy ever answers one of those POSTs with a plain
  // HTTP redirect, the browser's Server Actions client runtime can't
  // parse it (it expects an action-flight response, not a bare
  // redirect) and shows "An unexpected response was received from the
  // server" — this was the exact cause of a bug where a stale-but-
  // signature-valid session cookie caused Proxy to intercept the login
  // form's own submission. requireAdminSession() (src/lib/admin/dal.ts)
  // already redirects correctly from *inside* each Server Action, which
  // Next's client runtime handles properly — so Proxy only ever gates
  // GET navigation; every other method passes through untouched, and
  // the DAL is the sole authority for mutations.
  if (request.method !== "GET") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isAuthenticated = hasValidSession(request);

  if (pathname === LOGIN_PATH) {
    return isAuthenticated
      ? NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url))
      : NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
