import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Catalogue against a running LOCAL backend (throwaway data):
 * E2E_BASE_URL=http://127.0.0.1:3300 npm run test:e2e
 */
test.describe("catalogue", () => {
  test("loads real results, filters persist in the URL, chips remove filters", async ({ page }) => {
    await page.goto("/catalogue?sector=automobile&wilaya=Alger&inStock=true&sort=price_asc");
    await expect(page.getByText("Le catalogue est momentanément indisponible")).toHaveCount(0);
    await expect(page.locator("p[aria-live=polite]")).toContainText(/annonce/);
    const chips = page.getByRole("list", { name: "Filtres actifs" });
    await expect(chips).toContainText("Alger");
    await chips.getByRole("link", { name: /Alger/ }).click();
    await expect(page).not.toHaveURL(/wilaya=/);
    await expect(page).toHaveURL(/sector=automobile/);
    await expect(page).toHaveURL(/inStock=true/);
  });

  test("invalid params are dropped, not an error", async ({ page }) => {
    await page.goto("/catalogue?sector=avion&page=-3&sort=random");
    await expect(page.getByText("Le catalogue est momentanément indisponible")).toHaveCount(0);
  });

  test("an unknown VIN shows a VIN-specific empty state (never a fallback list)", async ({ page }) => {
    await page.goto("/catalogue?q=WVWZZZ1KZAW000001");
    await expect(page.getByRole("heading", { name: "Aucune annonce n'est liée à ce numéro VIN" })).toBeVisible();
    await expect(page.locator("p[aria-live=polite]")).toContainText("recherche par numéro VIN");
  });

  test("sector routes fix the sector", async ({ page }) => {
    for (const slug of ["automobile", "motos", "poids-lourds"]) {
      const res = await page.goto(`/categories/${slug}`);
      expect(res?.status()).toBe(200);
    }
    expect((await page.goto("/categories/avions"))?.status()).toBe(404);
  });

  test("catalogue page passes axe (WCAG 2.1 AA)", async ({ page }) => {
    await page.goto("/catalogue");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).exclude("canvas").analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});
