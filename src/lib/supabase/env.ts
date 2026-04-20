/**
 * Strict environment-variable access for Supabase.
 *
 * Rationale: instead of `process.env.FOO!` scattered across the codebase,
 * we fail fast with a descriptive error if a required variable is missing.
 * We keep SERVICE_ROLE isolated in a `serverOnly` helper so it can never
 * accidentally leak into a client bundle — referencing it in a client
 * component would make the bundler explode at build time.
 */

import "server-only";

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `[supabase] Missing required environment variable: ${name}. ` +
        "Add it to .env.local (dev) or your Vercel project settings.",
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

/**
 * Server-only. Never expose to the browser.
 * Importing this file from a client component is blocked by `server-only`
 * at bundle time.
 */
export function getSupabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
}
