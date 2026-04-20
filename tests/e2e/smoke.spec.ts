import { expect, test } from "@playwright/test";

/**
 * Smoke e2e — the bare minimum we want green on every CI run:
 *   - Home loads + has the hero copy.
 *   - Security headers are present.
 *   - Projects list renders.
 *   - Contact form renders and shows client-side validation errors.
 *
 * We DO NOT submit a real contact message here — that would hit the DB /
 * Resend / Turnstile in production. Submission paths are covered by the
 * Vitest unit suite on the pure handler.
 */

test.describe("public site — smoke", () => {
  test("home renders hero + nav", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Camille Saquet/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /projects/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /contact/i }).first()).toBeVisible();
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

  test("projects list renders cards", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // At least one project link back to a detail page.
    const firstCard = page.locator("article, li, a").filter({ hasText: /./ }).first();
    await expect(firstCard).toBeVisible();
  });

  test("about page renders timeline", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("contact form — client validation", () => {
  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/contact");

    const submit = page.getByRole("button", { name: /envoyer/i });
    await submit.click();

    // At least one inline error message appears.
    await expect(page.locator("[role='alert']").first()).toBeVisible();
  });

  test("rejects a malformed email before network", async ({ page }) => {
    await page.goto("/contact");

    // Capture any request fired to the contact API — should never fire.
    let apiCalled = false;
    page.on("request", (req) => {
      if (req.url().includes("/api/contact")) apiCalled = true;
    });

    await page.getByLabel(/nom/i).fill("Camille");
    await page.getByLabel(/email/i).fill("not-an-email");
    await page.getByLabel(/sujet/i).fill("Test sujet");
    await page.getByLabel(/message/i).fill("Message de test suffisamment long pour passer le min.");

    await page.getByRole("button", { name: /envoyer/i }).click();

    // Inline error appears.
    await expect(page.locator("[role='alert']").filter({ hasText: /email/i })).toBeVisible();
    // Give the browser a beat; API must still not have been hit.
    await page.waitForTimeout(250);
    expect(apiCalled).toBe(false);
  });
});
