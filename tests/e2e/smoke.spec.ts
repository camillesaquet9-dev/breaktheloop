import { expect, test } from "@playwright/test";

test.describe("BREAK THE LOOP — smoke", () => {
  test("home renders hero + brand", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BREAK THE LOOP/);
    await expect(page.getByRole("heading", { level: 1, name: /BREAK THE\s+LOOP/i })).toBeVisible();
  });

  test("nav links navigate", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /\[02\] Arène/i }).click();
    await expect(page).toHaveURL(/\/arena/);
    await page.getByRole("link", { name: /\[04\] Classement/i }).click();
    await expect(page).toHaveURL(/\/leaderboard/);
  });

  test("security headers are served", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers["content-security-policy"]).toMatch(/nonce-/);
    expect(headers["strict-transport-security"]).toMatch(/max-age=\d+/);
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBeDefined();
    expect(headers["permissions-policy"]).toBeDefined();
  });
});
