import "server-only";
import { Resend } from "resend";
import type { ContactEmailInput } from "./handler";

/**
 * Resend transactional email — forwards a contact form submission to the
 * owner's inbox. Reply-To is set to the submitter so the recipient can
 * reply directly from their mail client without going back to Supabase.
 *
 * Returns `false` on API failure; callers keep the DB row either way.
 */
export async function sendContactEmail(payload: ContactEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.RESEND_TO_EMAIL;

  if (!apiKey || !from || !to) {
    // Missing config — return false so the route adapter can log it. We
    // don't throw because the message is already persisted in Supabase.
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to,
      replyTo: payload.email,
      subject: `[breaktheloop] ${payload.subject}`,
      text: [
        `De   : ${payload.name} <${payload.email}>`,
        `Sujet: ${payload.subject}`,
        "",
        payload.body,
        "",
        "---",
        "breaktheloop.site — formulaire de contact",
      ].join("\n"),
    });
    return !result.error;
  } catch {
    return false;
  }
}
