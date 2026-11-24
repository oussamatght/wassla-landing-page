import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Header navigation at 1440 / 834 / 390 (projects in playwright.config.ts).
 * Run against a production server: E2E_BASE_URL=http://127.0.0.1:3300 npm run test:e2e
 */
const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("site header", () => {
  test("no horizontal overflow and a download action on every page", async ({ page }) => {
    for (const path of ["/", "/catalogue", "/categories/motos", "/prestataires", "/boost", "/telecharger", "/faq"]) {
      await page.goto(path);
      await noHorizontalOverflow(page);
      const header = page.locator("header").first();
      if (isDesktop(page) || (page.viewportSize()?.width ?? 0) >= 640) {
        await expect(header.getByRole("link", { name: "Télécharger l'app" })).toBeVisible();
      } else {
        await expect(header.getByRole("button", { name: "Ouvrir le menu" })).toBeVisible();
      }
    }
  });

  test("desktop: Catalogue dropdown with the three sectors, keyboard and Esc", async ({ page }) => {
    test.skip(!isDesktop(page), "desktop only");
    await page.goto("/prestataires");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav.getByRole("link", { name: "Prestataires" })).toHaveAttribute("aria-current", "page");
    const trigger = nav.getByRole("button", { name: "Catalogue" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    for (const name of ["Tout le catalogue", "Automobile", "Motos", "Poids lourds"]) {
      await expect(nav.getByRole("link", { name: new RegExp(name) })).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: /Tout le catalogue/ })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(nav.getByRole("link", { name: /^Automobile/ })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    // Click a sector: navigates, closes, and the Catalogue trigger becomes active.
    await trigger.click();
    await nav.getByRole("link", { name: /^Motos/ }).click();
    await expect(page).toHaveURL(/\/categories\/motos$/);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(nav.getByRole("link", { name: /^Motos/ })).toBeHidden();
  });

  test("mobile/tablet: accessible menu, Esc closes, closes after navigation, touch targets ≥ 44px", async ({ page }) => {
    test.skip(isDesktop(page), "mobile and tablet only");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Ouvrir le menu" });
    const box = await toggle.boundingBox();
    expect(box && box.width >= 44 && box.height >= 44).toBeTruthy();
    await toggle.click();
    const dialog = page.getByRole("dialog", { name: "Navigation principale" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Fermer le menu" })).toHaveAttribute("aria-expanded", "true");
    await expect(dialog.getByRole("link").first()).toBeFocused();
    // The panel covers the viewport under the 64px bar (regression: it once collapsed to 0px).
    const panel = await dialog.boundingBox();
    const vh = page.viewportSize()!.height;
    expect(panel && panel.y >= 63 && panel.height >= vh - 64 - 1).toBeTruthy();
    for (const name of ["Tout le catalogue", "Automobile", "Motos", "Poids lourds", "Prestataires", "Boost", "Télécharger l'app"]) {
      const link = dialog.getByRole("link", { name, exact: true });
      await expect(link).toBeVisible();
      const b = await link.boundingBox();
      expect(b && b.height >= 44, name).toBeTruthy();
    }
    await noHorizontalOverflow(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Ouvrir le menu" })).toBeFocused();

    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await dialog.getByRole("link", { name: "Prestataires", exact: true }).click();
    await expect(page).toHaveURL(/\/prestataires$/);
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(dialog.getByRole("link", { name: "Prestataires", exact: true })).toHaveAttribute("aria-current", "page");
  });

  test("header passes axe (WCAG 2.1 AA), menu open on small screens", async ({ page }) => {
    await page.goto("/catalogue");
    if (!isDesktop(page)) await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    else await page.getByRole("button", { name: "Catalogue" }).click();
    const results = await new AxeBuilder({ page }).include("header").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});
