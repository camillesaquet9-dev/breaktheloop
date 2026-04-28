import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * OAuth + magic-link callback.
 *
 * The trick: build the *redirect response* up-front and pass it to the
 * Supabase client's `setAll` cookie helper.  If we write the session
 * cookies to `cookies()` from `next/headers` and THEN call
 * `NextResponse.redirect(...)`, the new response object does not inherit
 * those cookies and the user lands on /arena unauthenticated.
 *
 * Reference: https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/arena";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as "magiclink" | "email" | "signup" | null;

  // Build the success response first; cookies will be attached to it.
  const successResponse = NextResponse.redirect(new URL(next, url));

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
      return redirectToSignin(url, `exchange_failed:${error.message.slice(0, 60)}`);
    }
    return successResponse;
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) {
      console.error("[auth/callback] verifyOtp failed:", error.message);
      return redirectToSignin(url, `otp_failed:${error.message.slice(0, 60)}`);
    }
    return successResponse;
  }

  return redirectToSignin(url, "missing_params");
}

function redirectToSignin(url: URL, reason: string) {
  const dest = new URL("/auth/signin", url);
  dest.searchParams.set("error", reason);
  return NextResponse.redirect(dest);
}
