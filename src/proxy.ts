import { type NextRequest, NextResponse } from "next/server";
import { buildSecurityHeaders, generateNonce } from "@/lib/security-headers";

/**
 * Per-request proxy (formerly `middleware.ts`; renamed in Next 16).
 * Responsible for:
 *   1. Generating a fresh CSP nonce.
 *   2. Forwarding the nonce to the app via the `x-nonce` request header
 *      so `app/layout.tsx` can stamp it on inline <script> tags.
 *   3. Applying the full suite of security response headers.
 *
 * We skip the proxy entirely for static assets and image optimisation
 * routes — those never inline scripts and adding a CSP to them is noise.
 */

const isDev = process.env.NODE_ENV !== "production";

export function proxy(request: NextRequest) {
  const nonce = generateNonce();

  // Forward the nonce to the rendered app via a request header so
  // RSC/layout can read it with `headers()` from next/headers.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const securityHeaders = buildSecurityHeaders({ nonce, isDev });
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  /**
   * Run on every route except:
   *   - _next/static (static assets)
   *   - _next/image  (Next Image optimiser)
   *   - favicon / robots / sitemap / well-known (static files)
   *   - any file with an extension under public/ (images, fonts, etc.)
   *
   * Keep API routes IN — they can return HTML errors that CSP must cover.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|humans\\.txt|\\.well-known).*)",
  ],
};
