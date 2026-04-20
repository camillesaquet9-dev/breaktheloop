/**
 * Hand-written Supabase type definitions.
 *
 * These mirror the migrations in `supabase/migrations/` 1:1. When the user
 * runs `pnpm db:types`, this file is overwritten by the Supabase CLI.
 *
 * Keeping the types checked in means:
 *   - CI can typecheck without network / Supabase project access,
 *   - reviewers see schema changes next to their migration,
 *   - local dev works before any Supabase project is even provisioned.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          subject: string;
          body: string;
          ip_hash: string;
          user_agent: string | null;
          referer: string | null;
          turnstile_action: string | null;
          honeypot_filled: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          subject: string;
          body: string;
          ip_hash: string;
          user_agent?: string | null;
          referer?: string | null;
          turnstile_action?: string | null;
          honeypot_filled?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          subject?: string;
          body?: string;
          ip_hash?: string;
          user_agent?: string | null;
          referer?: string | null;
          turnstile_action?: string | null;
          honeypot_filled?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ContactMessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];
export type ContactMessageInsert = Database["public"]["Tables"]["contact_messages"]["Insert"];
