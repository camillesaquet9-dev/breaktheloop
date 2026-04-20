import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

/**
 * Server-side Supabase client using the SERVICE_ROLE key. Bypasses RLS, so
 * it MUST only be used in trusted server contexts (API routes, Server
 * Components, Server Actions). The `server-only` import at the top makes
 * accidental client-side usage a bundle-time error.
 *
 * We do not cache a module-level singleton because Next.js Edge/Node
 * isolates workers per request in some runtimes, and re-creating the
 * client is cheap. The @supabase/supabase-js client is stateless.
 */
export function createSupabaseServiceClient(): SupabaseClient<Database> {
  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Makes it easy to filter logs on the Supabase side to requests
        // originating from our app vs. the Studio UI or psql.
        "x-client-info": "breaktheloop-server",
      },
    },
  });
}
