import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * OAuth + magic-link callback.
 *
 * - PKCE / OAuth: `?code=` is exchanged for a session.
 * - Magic link: `?token_hash=&type=` is verified.
 * - On success: redirect to `?next=` (default /arena).
 * - On failure: redirect to /auth/signin with `?error=`.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/arena";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as "magiclink" | "email" | null;

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirectToSignin(url, "exchange_failed");
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return redirectToSignin(url, "otp_failed");
  } else {
    return redirectToSignin(url, "missing_params");
  }

  return NextResponse.redirect(new URL(next, url));
}

function redirectToSignin(url: URL, reason: string) {
  const dest = new URL("/auth/signin", url);
  dest.searchParams.set("error", reason);
  return NextResponse.redirect(dest);
}
