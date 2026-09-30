import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

/**
 * Portfolio-surface tests.
 *
 * These check the thing this template exists to do: that a visitor sees a
 * real portfolio, that every section is present and readable, and that the
 * theme switcher, filters and contact form all work through the UI.
 *
 * They assert there were no uncaught page errors, because a page that renders
 * while throwing is not working.
 */

const consoleErrors: string[] = [];

function trackConsole(page: Page): void {
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));
}

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  trackConsole(page);
});

test.afterEach(() => {
  const real = consoleErrors.filter(
    (e) => !/favicon|ERR_BLOCKED_BY_CLIENT|Failed to load resource/i.test(e),
  );
  expect(real, `console errors:\n${real.join("\n")}`).toEqual([]);
});

/* -------------------------------------------------------------------------- */
/* Home page — every portfolio band                                            */
/* -------------------------------------------------------------------------- */

test("home page renders every portfolio section", async ({ page }) => {
  await page.goto("/");

  // Hero: name, role, photo, actions.
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Hi, I'm");
  await expect(page.getByText("Open to new work")).toBeVisible();
  const photo = page.locator("section").first().locator("img").first();
  await expect(photo).toBeVisible();

  // The rotating role is announced once for screen readers, not char by char.
  await expect(page.locator(".sr-only").filter({ hasText: "Full-Stack Developer" })).toBeAttached();

  // Stats.
  await expect(page.getByText("Years building")).toBeVisible();

  // Each band has a heading, so the page is navigable by screen reader.
  for (const heading of ["A bit about me", "The work, in four shapes", "What I reach for"]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  await expect(page.getByRole("heading", { name: "Things I built and shipped" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Where I've worked" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A motion lab that measures animation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Let's talk about your project" })).toBeVisible();
});

test("the photo is a real image, not a broken link", async ({ page }) => {
  const response = await page.request.get("/images/avatar.svg");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("svg");
});

/* -------------------------------------------------------------------------- */
/* Theme switcher                                                             */
/* -------------------------------------------------------------------------- */

test("theme switcher changes and remembers the palette", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");

  await expect(html).toHaveAttribute("data-theme", "bench");

  await page.getByRole("button", { name: /ink theme/i }).click();
  await expect(html).toHaveAttribute("data-theme", "ink");

  // Survives a reload, which is the point of the inline pre-paint script.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ink");

  await page.getByRole("button", { name: /paper theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "paper");
});

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

test("projects page filters, and the filter lives in the URL", async ({ page }) => {
  await page.goto("/projects");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("hard parts");
  const cards = page.getByRole("article");
  const total = await cards.count();
  expect(total).toBeGreaterThan(0);

  const postgres = page.getByRole("button", { name: /^Postgres/ });
  await expect(postgres).toBeVisible();
  await postgres.click();

  await expect(page).toHaveURL(/tag=Postgres/);
  await expect(postgres).toHaveAttribute("aria-pressed", "true");

  // router.replace is a client transition, so poll rather than reading the
  // DOM on the next tick.
  await expect
    .poll(async () => page.getByRole("article").count(), { timeout: 20_000 })
    .toBeGreaterThan(0);

  const filtered = await page.getByRole("article").count();
  expect(filtered).toBeLessThanOrEqual(total);

  // A filtered view is shareable: the URL restores the same result.
  await page.reload();
  await expect(page).toHaveURL(/tag=Postgres/);
  await expect(postgres).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => page.getByRole("article").count(), { timeout: 20_000 })
    .toBe(filtered);
});

test("a project case study is complete and has working links", async ({ page }) => {
  await page.goto("/projects/folio-motion");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Folio Motion");
  await expect(page.getByRole("heading", { name: "What made it interesting" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /proudest of/i })).toBeVisible();

  // Sidebar stack list.
  const sidebar = page.locator("aside");
  await expect(sidebar.getByText("Stack")).toBeVisible();
  await expect(sidebar.getByText("Next.js 16")).toBeVisible();

  // Real outbound links, opened safely.
  const live = page.getByRole("link", { name: /visit live site/i }).first();
  await expect(live).toHaveAttribute("href", /^https:\/\//);
  await expect(live).toHaveAttribute("target", "_blank");
  await expect(live).toHaveAttribute("rel", /noopener/);

  // And a route to the next case study.
  await expect(page.getByText("More projects")).toBeVisible();
});

test("an unknown project slug returns a real 404", async ({ page }) => {
  const response = await page.goto("/projects/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nothing on this bench");
});

/* -------------------------------------------------------------------------- */
/* Contact form                                                               */
/* -------------------------------------------------------------------------- */

test("contact form validates before sending anything", async ({ page }) => {
  await page.goto("/contact");

  // Submitting an empty form must not fire a request.
  let posted = false;
  page.on("request", (req) => {
    if (req.url().includes("/api/contact") && req.method() === "POST") posted = true;
  });

  await page.getByRole("button", { name: /send message/i }).click();

  await expect(page.getByText("Please add your name.")).toBeVisible();
  await expect(page.getByText("Please add your email.")).toBeVisible();
  await expect(page.getByText("A little more detail, please.")).toBeVisible();
  expect(posted, "no request should be sent for invalid input").toBe(false);

  // The error is wired to the input for screen readers.
  await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Your name")).toHaveAttribute("aria-describedby", /error/);
});

test("contact form rejects a malformed email", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Test Person");
  await page.getByLabel("Your email").fill("not-an-email");
  await page.getByLabel("What are you building?").fill("A project with a reasonably long message.");
  await page.getByRole("button", { name: /send message/i }).click();

  await expect(page.getByText("That doesn't look like an email address.")).toBeVisible();
});

test("contact form shows an honest fallback when email is not configured", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Test Person");
  await page.getByLabel("Your email").fill("test@example.com");
  await page.getByLabel("What are you building?").fill("I would like to talk about a project.");
  await page.getByRole("button", { name: /send message/i }).click();

  // Either it sent (a key is configured) or it explains itself and offers
  // mailto. Both are correct; a silent fake success is not.
  const sent = page.getByRole("heading", { name: /message sent/i });
  const failed = page.getByText(/email me directly instead/i);
  await expect(sent.or(failed).first()).toBeVisible({ timeout: 30_000 });

  if (await failed.isVisible().catch(() => false)) {
    await expect(page.getByRole("link", { name: /email me directly/i })).toHaveAttribute(
      "href",
      /^mailto:/,
    );
  }
});

/* -------------------------------------------------------------------------- */
/* Navigation, 404, keyboard                                                  */
/* -------------------------------------------------------------------------- */

test("404 page offers a way back", async ({ page }) => {
  const response = await page.goto("/this-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /back home/i })).toBeVisible();
  await page.getByRole("link", { name: /back home/i }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("skip link is the first tab stop", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /skip to content/i })).toBeFocused();
});

test("mobile menu opens, navigates and closes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile navigation only");
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  const nav = page.locator("#mobile-nav");
  await expect(nav).toBeVisible();

  await nav.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects/);
  await expect(nav).toBeHidden();
});
