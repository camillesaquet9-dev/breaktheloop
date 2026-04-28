import { type NextRequest, NextResponse } from "next/server";
import { refreshSupabaseSession } from "@/lib/auth/middleware-helpers";
import { buildSecurityHeaders, generateNonce } from "@/lib/security-headers";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Per-request proxy:
 *   1. Refresh the Supabase auth session (cookie rotation).
 *   2. Generate a fresh CSP nonce + apply security headers.
 *   3. Forward the nonce to the app via `x-nonce` request header.
 */
export async function proxy(request: NextRequest) {
  // Run auth refresh first; it returns a NextResponse with the latest cookies.
  const authResponse = await refreshSupabaseSession(request);

  const nonce = generateNonce();
  authResponse.headers.set("x-nonce", nonce);
  // Forward the nonce to RSC layout via a request-header echo.
  request.headers.set("x-nonce", nonce);

  // Re-emit the response with auth cookies + security headers.
  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  for (const c of authResponse.cookies.getAll()) {
    response.cookies.set(c.name, c.value, c);
  }

  for (const [k, v] of Object.entries(buildSecurityHeaders({ nonce, isDev }))) {
    response.headers.set(k, v);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|humans\\.txt|\\.well-known).*)",
  ],
};
