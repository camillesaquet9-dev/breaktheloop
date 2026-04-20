import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ContactInsertInput } from "./handler";

/**
 * Server-only helper that wraps the Supabase insert so the contact handler
 * can remain pure + testable (it only sees a boolean).
 */
export async function insertContactMessage(payload: ContactInsertInput): Promise<boolean> {
  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      body: payload.body,
      ip_hash: payload.ipHash,
      user_agent: payload.userAgent,
      referer: payload.referer,
      turnstile_action: payload.turnstileAction,
      honeypot_filled: payload.honeypotFilled,
    });
    return !error;
  } catch {
    return false;
  }
}
