// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { type ContactHandlerDeps, handleContactSubmission } from "./handler";

/**
 * Handler tests — exercise every branch of the discriminated union with
 * fake dependencies. No Supabase, Resend, Upstash, or Turnstile calls here.
 */

function makeDeps(overrides: Partial<ContactHandlerDeps> = {}): ContactHandlerDeps {
  return {
    hashIp: vi.fn(async () => "deadbeef".repeat(8)),
    consumeRateLimit: vi.fn(async () => true),
    verifyTurnstile: vi.fn(async () => true),
    insertMessage: vi.fn(async () => true),
    sendEmail: vi.fn(async () => true),
    requireTurnstile: false,
    ...overrides,
  };
}

const goodPayload = {
  name: "Camille",
  email: "camille@breaktheloop.site",
  subject: "Proposition alternance",
  body: "Bonjour, message de test suffisamment long pour passer la validation.",
  turnstileToken: "cf-ok",
};

const ctx = {
  rawPayload: goodPayload,
  ip: "203.0.113.7",
  userAgent: "Mozilla/5.0 (test)",
  referer: "https://breaktheloop.site/contact",
};

describe("handleContactSubmission — happy path", () => {
  it("returns ok:true and calls every dep in order", async () => {
    const deps = makeDeps();
    const result = await handleContactSubmission(ctx, deps);
    expect(result).toEqual({ ok: true });
    expect(deps.hashIp).toHaveBeenCalledWith(ctx.ip);
    expect(deps.consumeRateLimit).toHaveBeenCalledTimes(1);
    expect(deps.insertMessage).toHaveBeenCalledTimes(1);
    expect(deps.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("persists the hashed IP, not the raw IP", async () => {
    const deps = makeDeps();
    await handleContactSubmission(ctx, deps);
    const call = (deps.insertMessage as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(call.ipHash).toBe("deadbeef".repeat(8));
    // sanity — raw IP must never appear on the insert payload
    expect(JSON.stringify(call)).not.toContain("203.0.113.7");
  });
});

describe("handleContactSubmission — validation", () => {
  it("rejects a malformed email", async () => {
    const deps = makeDeps();
    const result = await handleContactSubmission(
      { ...ctx, rawPayload: { ...goodPayload, email: "nope" } },
      deps,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("validation");
    expect(deps.insertMessage).not.toHaveBeenCalled();
  });

  it("rejects a completely unrelated shape", async () => {
    const deps = makeDeps();
    const result = await handleContactSubmission({ ...ctx, rawPayload: { lol: 1 } }, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("validation");
  });
});

describe("handleContactSubmission — honeypot", () => {
  it("short-circuits when honeypot is filled, never hits rate-limit or insert", async () => {
    const deps = makeDeps();
    const result = await handleContactSubmission(
      { ...ctx, rawPayload: { ...goodPayload, honeypot: "bot-says-hi" } },
      deps,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("honeypot");
    expect(deps.consumeRateLimit).not.toHaveBeenCalled();
    expect(deps.insertMessage).not.toHaveBeenCalled();
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });
});

describe("handleContactSubmission — rate limit", () => {
  it("returns rate_limit when the budget is exhausted", async () => {
    const deps = makeDeps({ consumeRateLimit: vi.fn(async () => false) });
    const result = await handleContactSubmission(ctx, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("rate_limit");
    expect(deps.insertMessage).not.toHaveBeenCalled();
  });
});

describe("handleContactSubmission — turnstile", () => {
  it("rejects a missing token when turnstile is required", async () => {
    const deps = makeDeps({ requireTurnstile: true });
    const result = await handleContactSubmission(
      { ...ctx, rawPayload: { ...goodPayload, turnstileToken: undefined } },
      deps,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("turnstile");
      expect(result.details).toBe("missing token");
    }
  });

  it("rejects a token that fails siteverify", async () => {
    const deps = makeDeps({
      requireTurnstile: true,
      verifyTurnstile: vi.fn(async () => false),
    });
    const result = await handleContactSubmission(ctx, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("turnstile");
    expect(deps.insertMessage).not.toHaveBeenCalled();
  });

  it("skips turnstile entirely when not required (dev)", async () => {
    const deps = makeDeps({ requireTurnstile: false });
    await handleContactSubmission(ctx, deps);
    expect(deps.verifyTurnstile).not.toHaveBeenCalled();
  });
});

describe("handleContactSubmission — persistence", () => {
  it("returns insert_failed when Supabase insert fails", async () => {
    const deps = makeDeps({ insertMessage: vi.fn(async () => false) });
    const result = await handleContactSubmission(ctx, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("insert_failed");
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });
});

describe("handleContactSubmission — email is non-fatal", () => {
  it("still returns ok:true when sendEmail returns false (DB row kept)", async () => {
    const deps = makeDeps({ sendEmail: vi.fn(async () => false) });
    const result = await handleContactSubmission(ctx, deps);
    expect(result).toEqual({ ok: true });
  });

  it("still returns ok:true when sendEmail throws", async () => {
    const deps = makeDeps({
      sendEmail: vi.fn(async () => {
        throw new Error("resend down");
      }),
    });
    const result = await handleContactSubmission(ctx, deps);
    expect(result).toEqual({ ok: true });
  });
});
