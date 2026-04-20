// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { extractClientIp, hashIpWithSalt } from "./ip-hash";

describe("extractClientIp — header trust order", () => {
  it("prefers cf-connecting-ip when present", () => {
    const h = new Headers({
      "cf-connecting-ip": "198.51.100.1",
      "x-forwarded-for": "192.0.2.5, 10.0.0.1",
      "x-real-ip": "10.0.0.1",
    });
    expect(extractClientIp(h)).toBe("198.51.100.1");
  });

  it("falls back to the leftmost x-forwarded-for entry", () => {
    const h = new Headers({
      "x-forwarded-for": "  203.0.113.9 , 10.0.0.1",
    });
    expect(extractClientIp(h)).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip when XFF is absent", () => {
    const h = new Headers({ "x-real-ip": "203.0.113.42" });
    expect(extractClientIp(h)).toBe("203.0.113.42");
  });

  it("returns 0.0.0.0 when no header is set", () => {
    expect(extractClientIp(new Headers())).toBe("0.0.0.0");
  });
});

describe("hashIpWithSalt — SHA-256 salted digest", () => {
  const ORIGINAL_SALT = process.env.SECRET_IP_SALT;

  beforeEach(() => {
    process.env.SECRET_IP_SALT = "a".repeat(32);
  });

  afterEach(() => {
    process.env.SECRET_IP_SALT = ORIGINAL_SALT;
  });

  it("produces a 64-character lowercase hex digest", async () => {
    const out = await hashIpWithSalt("192.0.2.1");
    expect(out).toHaveLength(64);
    expect(out).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same IP + salt", async () => {
    const a = await hashIpWithSalt("192.0.2.1");
    const b = await hashIpWithSalt("192.0.2.1");
    expect(a).toBe(b);
  });

  it("differs across different IPs", async () => {
    const a = await hashIpWithSalt("192.0.2.1");
    const b = await hashIpWithSalt("192.0.2.2");
    expect(a).not.toBe(b);
  });

  it("throws when SECRET_IP_SALT is shorter than 32 chars", async () => {
    process.env.SECRET_IP_SALT = "short";
    await expect(hashIpWithSalt("192.0.2.1")).rejects.toThrow(/SECRET_IP_SALT/);
  });

  it("throws when SECRET_IP_SALT is unset", async () => {
    delete process.env.SECRET_IP_SALT;
    await expect(hashIpWithSalt("192.0.2.1")).rejects.toThrow();
  });
});
