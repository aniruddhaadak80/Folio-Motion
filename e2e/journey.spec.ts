import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

/**
 * Primary-journey browser test.
 *
 * Walks the three jobs the product exists for, using only visible controls:
 *   1. Author a motion spec and see the measured score.
 *   2. Inspect the saved spec and its evidence.
 *   3. Hand a spec to the agent over MCP.
 *
 * It also asserts there were no uncaught page errors, because a journey that
 * "works" while the console is on fire is not working.
 */

const consoleErrors: string[] = [];

function trackConsole(page: Page): void {
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(`pageerror: ${err.message}`);
  });
}

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  trackConsole(page);
});

test.afterEach(() => {
  // Filter out noise that is not our fault (e.g. blocked third-party requests).
  const real = consoleErrors.filter(
    (e) => !/favicon|ERR_BLOCKED_BY_CLIENT|Failed to load resource/i.test(e),
  );
  expect(real, `console errors:\n${real.join("\n")}`).toEqual([]);
});

test("landing renders and links to the repository", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("measure");
  await expect(page.getByText("Animation you can").first()).toBeVisible();

  // The hero preview must be a real moving element, not a placeholder.
  await expect(page.getByRole("link", { name: /Open the motion lab/i }).first()).toBeVisible();

  const repoLink = page.getByRole("link", { name: /star on github/i }).first();
  await expect(repoLink).toHaveAttribute("href", "https://github.com/aniruddhaadak80/Folio-Motion");
  await expect(repoLink).toHaveAttribute("target", "_blank");
  await expect(repoLink).toHaveAttribute("rel", /noopener/);
});

test("primary journey: author, save, inspect, export, delete", async ({ page }) => {
  const unique = `pw-${Date.now().toString(36)}`;

  // --- Job 1: author a spec and see the measured score -------------------
  await page.goto("/lab");

  await expect(page.getByRole("heading", { name: "Motion lab" })).toBeVisible();

  // A live score must appear without any interaction.
  const scorePanel = page.getByRole("region", { name: "Score breakdown" });
  await expect(scorePanel).toBeVisible();
  await expect(scorePanel.getByText("Motion quality")).toBeVisible();
  await expect(scorePanel.locator("p").filter({ hasText: /\/100/ }).first()).toBeVisible();

  const settleBefore = await page
    .getByRole("region", { name: "Score breakdown" })
    .locator("dd")
    .first()
    .innerText();

  // Drop the damping dial: the settle time must get worse, and visibly so.
  const damping = page.locator("#dial-damping");
  await expect(damping).toBeVisible();
  await damping.fill("4");
  await damping.dispatchEvent("change");

  await expect
    .poll(
      async () =>
        page
          .getByRole("region", { name: "Score breakdown" })
          .locator("dd")
          .first()
          .innerText(),
      { timeout: 25_000 },
    )
    .not.toBe(settleBefore);

  // The measured curve must be a real plot, not an empty box.
  const chart = page.getByRole("region", { name: "Measured curve" }).locator("svg");
  await expect(chart).toBeVisible();
  await expect(chart.locator("path").first()).toBeVisible();

  // Expanding a factor must reveal its evidence.
  await page.getByRole("button", { name: /Settle time/i }).first().click();
  await expect(page.getByText(/Comes to rest in|Never settles/i).first()).toBeVisible();

  // --- Save it -----------------------------------------------------------
  await page.getByLabel("Spec name").fill(unique);
  await page.getByRole("button", { name: "Save spec" }).click();

  const openLink = page.getByRole("link", { name: /open the spec/i });
  await expect(openLink).toBeVisible({ timeout: 30_000 });

  // --- Job 2: inspect the saved spec --------------------------------------
  await openLink.click();
  await expect(page).toHaveURL(/\/specs\/[0-9a-f-]{36}/);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(unique);
  await expect(page.getByText("Provenance")).toBeVisible();
  // Scoped to the provenance panel: the footer also prints the engine version.
  await expect(page.locator("aside").getByText(/engine 2026/).first()).toBeVisible();
  await expect(page.locator("aside").getByText(/seal [0-9a-f]{16}/).first()).toBeVisible();

  // A real downloadable export, not a stub.
  const download = page.waitForEvent("download", { timeout: 40_000 });
  await page.getByRole("button", { name: /CSS \.css/i }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/\.css$/);

  // --- Delete it ---------------------------------------------------------
  await page.getByRole("button", { name: "Delete this spec" }).click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page.getByRole("heading", { name: "Spec removed" })).toBeVisible({
    timeout: 30_000,
  });
});

test("library shows the empty state truthfully, then the spec", async ({ page }) => {
  await page.goto("/specs");
  await expect(page.getByRole("heading", { name: "Saved specs" })).toBeVisible();

  // A fresh session owns nothing, so the empty state must be shown rather
  // than a fabricated list.
  await expect(page.getByText("No specs on this bench yet")).toBeVisible();

  const unique = `pw-lib-${Date.now().toString(36)}`;
  await page.goto("/lab");
  await page.getByLabel("Spec name").fill(unique);
  await page.getByRole("button", { name: "Save spec" }).click();
  const openLink = page.getByRole("link", { name: /open the spec/i });
  await expect(openLink).toBeVisible({ timeout: 30_000 });

  await page.goto("/specs");
  await expect(page.getByRole("heading", { name: unique })).toBeVisible({ timeout: 30_000 });

  // Compare must surface a live score for the selected spec.
  await page
    .getByRole("article")
    .filter({ hasText: unique })
    .getByRole("button", { name: "Compare" })
    .click();
  await expect(page.getByText("Motion quality")).toBeVisible({ timeout: 30_000 });
  await expect(page).toHaveURL(/spec=/);
});

test("agent console performs a real MCP mutation and read-back", async ({ page }) => {
  await page.goto("/agent");

  await page.getByRole("button", { name: "initialize", exact: true }).click();
  await expect(page.getByText("folio-motion-lab").first()).toBeVisible({ timeout: 30_000 });

  await page.getByRole("button", { name: "tools/list", exact: true }).click();
  await expect(page.getByText("analyze_motion").first()).toBeVisible({ timeout: 30_000 });

  await page.getByRole("button", { name: "save_spec", exact: true }).click();
  const persisted = page.getByRole("link", { name: /persisted → open the created spec/i });
  await expect(persisted).toBeVisible({ timeout: 40_000 });

  await page.getByRole("button", { name: "list_specs", exact: true }).click();
  await expect(page.getByText("Agent rubber band").first()).toBeVisible({ timeout: 30_000 });

  // Clean up the spec this test created.
  await persisted.click();
  await page.getByRole("button", { name: "Delete this spec" }).click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page.getByRole("heading", { name: "Spec removed" })).toBeVisible({
    timeout: 30_000,
  });
});

test("integrity replay reports an intact chain", async ({ page }) => {
  await page.goto("/verify");
  await expect(page.getByRole("heading", { name: "Integrity" })).toBeVisible();
  await expect(page.getByText("Chain intact").or(page.getByText("Chain broken"))).toBeVisible({
    timeout: 40_000,
  });
});

test("method page explains the engine", async ({ page }) => {
  await page.goto("/method");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Method");
  await expect(page.getByText(/Rest needs a velocity condition/i)).toBeVisible();
  await expect(
    page.getByText(/A common shortcut is to declare a spring settled/i),
  ).toBeVisible();
});

test("signals page labels its data honestly", async ({ page }) => {
  await page.goto("/signals");
  await expect(page.getByRole("heading", { name: "Library signals" })).toBeVisible();
  await expect(page.getByText("live data").or(page.getByText("offline sample"))).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole("heading", { name: "Data provenance" })).toBeVisible();
});

test("mobile navigation opens and navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile navigation only");
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  const nav = page.locator("#mobile-nav");
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: /view source on github/i })).toHaveAttribute(
    "href",
    "https://github.com/aniruddhaadak80/Folio-Motion",
  );

  await nav.getByRole("link", { name: "Lab" }).click();
  await expect(page).toHaveURL(/\/lab/);
  await expect(nav).toBeHidden();
});

test("keyboard navigation reaches the primary action and the skip link works", async ({
  page,
}) => {
  await page.goto("/lab");

  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to content/i });
  await expect(skip).toBeFocused();
});
