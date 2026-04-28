/**
 * Public env-var accessors safe for both server and client.
 * NEXT_PUBLIC_* vars are inlined into the client bundle by Next.js.
 *
 * The service-role key lives in `server.ts` so it can never reach the browser.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `[supabase] Missing required environment variable: ${name}. Add it to .env.local.`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string {
  return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
