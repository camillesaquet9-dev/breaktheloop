import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseUrl } from "./env";

function getServiceRoleKey(): string {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!v) {
    throw new Error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY missing. Bypassing this var is a server-only path.",
    );
  }
  return v;
}

/**
 * Server-side Supabase client using the SERVICE_ROLE key. Bypasses RLS, so
 * it MUST only be used in trusted server contexts (API routes, Server
 * Actions). The `server-only` import at the top makes accidental client-side
 * usage a bundle-time error.
 */
export function createSupabaseServiceClient(): SupabaseClient<Database> {
  return createClient<Database>(getSupabaseUrl(), getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "x-client-info": "breaktheloop-server" },
    },
  });
}
