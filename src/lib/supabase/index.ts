/**
 * Barrel export. Types-only + browser-safe. Server-only code (the
 * service_role client) MUST be imported from `@/lib/supabase/server`
 * directly — re-exporting it here would poison client bundles because
 * `server-only` would trip.
 */

export { getSupabaseBrowserClient } from "./browser";
export type {
  ContactMessageInsert,
  ContactMessageRow,
  Database,
  Json,
} from "./database.types";
