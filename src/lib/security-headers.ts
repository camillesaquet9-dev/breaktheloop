/**
 * Centralised security-header builder.
 *
 * Goals:
 * - HSTS (preload-ready): one year, subdomains, preload.
 * - Frame busting: DENY (we never want to be iframed).
 * - MIME sniffing: nosniff.
 * - Cross-origin isolation: COOP same-origin, CORP same-origin.
 *   CORP "same-origin" blocks cross-origin fetches of our assets; our
 *   assets are all first-party so this is safe and strictly tighter
 *   than "same-site".
 * - Referrer: strict-origin-when-cross-origin (standard modern default).
 * - Permissions-Policy: deny everything we don't explicitly need.
 * - CSP: per-request nonce injected into inline <script> tags. We do NOT
 *   use 'unsafe-inline' for scripts — any inline script must carry the
 *   nonce (only the theme-init script qualifies, and the layout reads the
 *   nonce from the request header to emit it).
 *
 * The nonce is generated per request in `middleware.ts` and forwarded to
 * the app through an `x-nonce` request header, which `layout.tsx` reads
 * via `next/headers`. That keeps nonce generation outside of React and
 * avoids bundling crypto into the client.
 */

/** Generate a 128-bit base64 nonce using the Edge crypto API. */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // btoa is available in the Edge runtime.
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export type SecurityHeaderContext = {
  nonce: string;
  /** Dev mode relaxes CSP to allow Turbopack/HMR (ws + eval). */
  isDev: boolean;
};

/**
 * Build a Content-Security-Policy string.
 *
 * strict-dynamic note: we rely on nonces + strict-dynamic for scripts.
 * Any script loaded by a nonced script inherits trust, which matches
 * Next.js's loader behaviour.
 */
function buildContentSecurityPolicy({ nonce, isDev }: SecurityHeaderContext): string {
  // Next.js dev server needs ws: for HMR and 'unsafe-eval' for Turbopack.
  const scriptSrcExtras = isDev ? "'unsafe-eval'" : "";
  const connectSrcExtras = isDev ? "ws: wss:" : "";

  const directives: Record<string, string> = {
    "default-src": "'self'",
    "base-uri": "'self'",
    "object-src": "'none'",
    "frame-ancestors": "'none'",
    "form-action": "'self'",
    "script-src": `'self' 'nonce-${nonce}' 'strict-dynamic' ${scriptSrcExtras}`.trim(),
    // Fontsource fonts are self-hosted, so font-src stays 'self'.
    "font-src": "'self' data:",
    // Tailwind injects <style> tags; we allow nonce + 'unsafe-inline' ONLY
    // here because CSP spec forbids mixing nonce+strict-dynamic with styles
    // in a way that breaks Next. Style is a much lower XSS risk than script.
    "style-src": `'self' 'unsafe-inline'`,
    "style-src-elem": `'self' 'unsafe-inline'`,
    "style-src-attr": `'unsafe-inline'`,
    "img-src": "'self' data: blob:",
    "media-src": "'self'",
    "worker-src": "'self' blob:",
    "manifest-src": "'self'",
    "connect-src": `'self' ${connectSrcExtras}`.trim(),
    "frame-src": "'none'",
    "upgrade-insecure-requests": "",
  };

  return Object.entries(directives)
    .map(([key, value]) => (value.length === 0 ? key : `${key} ${value}`))
    .join("; ");
}

/**
 * Permissions-Policy — deny every powerful API we don't need. If we later
 * add (e.g.) camera usage for a specific page, we can override per-route.
 */
const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "autoplay=()",
  "camera=()",
  "display-capture=()",
  "encrypted-media=()",
  "fullscreen=(self)",
  "geolocation=()",
  "gyroscope=()",
  "hid=()",
  "idle-detection=()",
  "interest-cohort=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "picture-in-picture=()",
  "publickey-credentials-get=()",
  "screen-wake-lock=()",
  "serial=()",
  "sync-xhr=()",
  "usb=()",
  "xr-spatial-tracking=()",
].join(", ");

export function buildSecurityHeaders(ctx: SecurityHeaderContext): Record<string, string> {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy(ctx),
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": PERMISSIONS_POLICY,
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    // COEP require-corp breaks Next's RSC streaming in some scenarios;
    // keep it off unless we explicitly need SharedArrayBuffer.
    "X-DNS-Prefetch-Control": "off",
    "X-Permitted-Cross-Domain-Policies": "none",
  };
}
