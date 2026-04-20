import { z } from "zod";

/**
 * Pure Zod schema for the contact form. Shared between:
 *   - client-side form validation (react-hook-form + zodResolver),
 *   - server-side double-validation in the API route.
 *
 * No environment access, no Next.js imports → fully unit-testable with
 * Vitest in a Node environment.
 *
 * Length bounds mirror the CHECK constraints on the `contact_messages`
 * table (20260416120000_contact_messages.sql). Keep the two in sync:
 * if you loosen one, loosen the other.
 */

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nom trop court (2 caractères minimum).")
    .max(120, "Nom trop long (120 max)."),
  email: z
    .string()
    .trim()
    .email("Email invalide.")
    .min(5, "Email trop court.")
    .max(254, "Email trop long (254 max)."),
  subject: z
    .string()
    .trim()
    .min(3, "Sujet trop court (3 caractères minimum).")
    .max(200, "Sujet trop long (200 max)."),
  body: z
    .string()
    .trim()
    .min(10, "Message trop court (10 caractères minimum).")
    .max(5000, "Message trop long (5000 max)."),
  /** Cloudflare Turnstile token returned by the widget. Optional only in
   *  tests + dev: the server-side validator enforces presence in prod. */
  turnstileToken: z.string().optional(),
  /**
   * Honeypot — hidden field; real users never fill it. We intentionally DO
   * NOT reject a filled honeypot at the schema level: the handler has its
   * own branch that returns `reason: "honeypot"`, which the route adapter
   * maps to HTTP 200 (silent success) so bots stop retrying. Capping max()
   * here would turn the bot hit into a 400 and defeat the ruse.
   */
  honeypot: z.string().max(5000).optional(),
});

export type ContactPayload = z.infer<typeof contactSchema>;
