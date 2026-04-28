import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * OAuth + magic-link callback.
 *
 * Two gotchas behind a reverse proxy (Caddy → Docker btl-app:3000):
 *   1. `request.url` reports the INTERNAL host (`http://0.0.0.0:3000`).
 *      We build redirects from `NEXT_PUBLIC_SITE_URL` instead so the
 *      browser bounces back to https://breaktheloop.fr.
 *   2. `NextResponse.redirect(...)` does NOT inherit cookies set via
 *      `cookies()` from `next/headers`. We construct the response first
 *      and write Supabase's session cookies onto IT directly.
 */
function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

function publicRedirect(path: string): NextResponse {
  return NextResponse.redirect(new URL(path, siteUrl()));
}

function redirectToSignin(reason: string): NextResponse {
  const u = new URL("/auth/signin", siteUrl());
  u.searchParams.set("error", reason);
  return NextResponse.redirect(u);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/arena";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as "magiclink" | "email" | "signup" | null;

  // Build the success response first; cookies will be attached to it.
  const successResponse = publicRedirect(next.startsWith("/") ? next : "/arena");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            successResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
      return redirectToSignin(`exchange_failed:${error.message.slice(0, 80)}`);
    }
    return successResponse;
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) {
      console.error("[auth/callback] verifyOtp failed:", error.message);
      return redirectToSignin(`otp_failed:${error.message.slice(0, 80)}`);
    }
    return successResponse;
  }

  return redirectToSignin("missing_params");
}
