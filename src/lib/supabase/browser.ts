import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * Browser-side Supabase client. Anon key only — RLS enforces authorisation.
 *
 * Currently unused in the app (the portfolio has no user-facing Supabase
 * reads), but kept available for future features (auth, realtime).
 *
 * Safe to import from client components.
 */
let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  }
  return browserClient;
}
