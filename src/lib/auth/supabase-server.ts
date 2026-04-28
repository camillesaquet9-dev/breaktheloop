import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * SSR Supabase client (anon key + cookie session).  Use in Server Components,
 * Server Actions and Route Handlers when you need the *user's* session.
 *
 * Prefer this over the raw service-role client whenever the operation should
 * be RLS-bound to the current user.  Service-role is reserved for trusted
 * server work (writing attempts, rotating daily, refreshing leaderboard).
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // The Server Component runtime forbids cookie writes outside
          // route handlers / actions.  In that case the proxy refreshes
          // the session via middleware on the next request.
        }
      },
    },
  });
}

export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
