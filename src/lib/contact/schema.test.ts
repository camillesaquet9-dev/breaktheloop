// @vitest-environment node
import { describe, expect, it } from "vitest";
import { contactSchema } from "./schema";

/**
 * Schema tests — pure Zod, no DOM. Runs in Node for speed.
 *
 * Mirrors the CHECK constraints in the contact_messages migration; if these
 * tests fail after a schema change, the migration probably also needs to move.
 */

const base = {
  name: "Camille Saquet",
  email: "camille@breaktheloop.site",
  subject: "Proposition alternance",
  body: "Bonjour, je vous contacte au sujet d'une alternance 3 ans en cyberdéfense.",
};

describe("contactSchema — happy path", () => {
  it("accepts a minimal valid payload", () => {
    const r = contactSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("trims whitespace around fields", () => {
    const r = contactSchema.safeParse({ ...base, name: "  Camille  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Camille");
  });

  it("accepts an optional Turnstile token", () => {
    const r = contactSchema.safeParse({ ...base, turnstileToken: "cf-chal-abc" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.turnstileToken).toBe("cf-chal-abc");
  });
});

describe("contactSchema — validation errors", () => {
  it("rejects name shorter than 2 characters", () => {
    const r = contactSchema.safeParse({ ...base, name: "C" });
    expect(r.success).toBe(false);
  });

  it("rejects name longer than 120 characters", () => {
    const r = contactSchema.safeParse({ ...base, name: "a".repeat(121) });
    expect(r.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const r = contactSchema.safeParse({ ...base, email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects body longer than 5000 characters", () => {
    const r = contactSchema.safeParse({ ...base, body: "a".repeat(5001) });
    expect(r.success).toBe(false);
  });

  it("rejects subject shorter than 3 characters", () => {
    const r = contactSchema.safeParse({ ...base, subject: "ok" });
    expect(r.success).toBe(false);
  });
});

describe("contactSchema — honeypot", () => {
  it("accepts a missing honeypot field", () => {
    const r = contactSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("accepts an empty honeypot string", () => {
    const r = contactSchema.safeParse({ ...base, honeypot: "" });
    expect(r.success).toBe(true);
  });

  it("lets a filled honeypot THROUGH validation (so the handler can 200-it)", () => {
    // Design contract: schema must NOT reject a filled honeypot, otherwise
    // the route returns 400 and bots know to retry. The handler itself
    // short-circuits with reason: "honeypot" → HTTP 200.
    const r = contactSchema.safeParse({ ...base, honeypot: "spam-bot-filled-me" });
    expect(r.success).toBe(true);
  });
});
