import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Accessibility + layout sweep of EVERY public route, at 1440 / 834 / 390.
 * Needs a production server and a LOCAL backend with data:
 *   E2E_BASE_URL=http://127.0.0.1:3300 E2E_API_URL=http://127.0.0.1:5000/api npm run test:e2e
 */
const API = process.env.E2E_API_URL ?? "http://127.0.0.1:5000/api";

const STATIC_ROUTES = [
  "/",
  "/catalogue",
  "/catalogue?sector=moto&inStock=true",
  "/categories/automobile",
  "/categories/motos",
  "/categories/poids-lourds",
  "/prestataires",
  "/prestataires/publier",
  "/espace-prestataire",
  "/boost",
  "/telecharger",
  "/comment-ca-marche",
  "/vendre",
  "/faq",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
  "/cgu",
];

async function firstId(path: string, pick: (d: Record<string, unknown>) => string | undefined): Promise<string | undefined> {
  try {
    const res = await fetch(API + path);
    const json = (await res.json()) as { data: Record<string, unknown> };
    return pick(json.data);
  } catch {
    return undefined;
  }
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).exclude("canvas").analyze();
  return results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

async function overflowPx(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe("every public route", () => {
  const routes = [...STATIC_ROUTES];

  test.beforeAll(async () => {
    const productId = await firstId("/public/landing/products?limit=1", (d) => (d.products as Array<{ id: string }>)[0]?.id);
    const providerId = await firstId("/public/landing/providers?limit=1", (d) => (d.listings as Array<{ id: string }>)[0]?.id);
    if (productId) routes.push(`/products/${productId}`);
    if (providerId) routes.push(`/prestataires/${providerId}`);
  });

  test("axe WCAG 2.1 AA, one h1, no horizontal overflow, landmarks", async ({ page }) => {
    test.setTimeout(240_000);
    const problems: string[] = [];
    for (const path of routes) {
      const res = await page.goto(path, { waitUntil: "load" });
      if (!res || res.status() >= 400) {
        problems.push(`${path}: HTTP ${res?.status()}`);
        continue;
      }
      const violations = await axe(page);
      if (violations.length) problems.push(`${path}: ${violations.join(" ; ")}`);
      const h1 = await page.locator("h1").count();
      if (h1 !== 1) problems.push(`${path}: ${h1} <h1>`);
      const overflow = await overflowPx(page);
      if (overflow > 0) problems.push(`${path}: horizontal overflow ${overflow}px`);
      if ((await page.locator("main#contenu").count()) !== 1) problems.push(`${path}: missing <main id="contenu">`);
      if ((await page.locator("footer").count()) < 1) problems.push(`${path}: missing footer`);
    }
    expect(problems).toEqual([]);
  });

  test("unknown route: 404 page is accessible and offers a way back", async ({ page }) => {
    const res = await page.goto("/cette-page-n-existe-pas");
    expect(res?.status()).toBe(404);
    expect(await axe(page)).toEqual([]);
    await expect(page.locator("main a[href='/']").first()).toBeVisible();
  });
});

test.describe("keyboard", () => {
  test("skip link is the first stop and moves focus to the main content", async ({ page }) => {
    await page.goto("/catalogue");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#contenu")).toBeFocused();
  });

  test("every Tab stop in the first 25 is visible and has an accessible name", async ({ page }) => {
    await page.goto("/");
    const issues: string[] = [];
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const labelledBy = el.getAttribute("aria-labelledby");
        const fromLabels = (el as HTMLInputElement).labels ? Array.from((el as HTMLInputElement).labels ?? []).map((l) => l.textContent ?? "").join(" ") : "";
        const name = (
          el.getAttribute("aria-label") ||
          (labelledBy ? document.getElementById(labelledBy)?.textContent : "") ||
          fromLabels ||
          el.textContent ||
          (el as HTMLInputElement).value ||
          el.getAttribute("title") ||
          ""
        ).trim();
        return { tag: el.tagName, name: name.slice(0, 40), visible: r.width > 0 && r.height > 0 && style.visibility !== "hidden" && style.opacity !== "0" };
      });
      if (!info) continue;
      if (!info.visible) issues.push(`invisible focus stop: ${info.tag} "${info.name}"`);
      if (!info.name && info.tag !== "MAIN") issues.push(`unnamed focus stop: ${info.tag}`);
    }
    expect(issues).toEqual([]);
  });
});

test.describe("dialogs", () => {
  test("product gallery: opens, Esc closes, focus returns", async ({ page }) => {
    const id = await firstId("/public/landing/products?limit=48", (d) => (d.products as Array<{ id: string; images?: unknown[]; imageUrl?: string }>).find((p) => (p.images?.length ?? 0) > 0 || p.imageUrl)?.id);
    test.skip(!id, "no product with photos in the local data");
    await page.goto(`/products/${id}`);
    const opener = page.getByRole("button", { name: /Agrandir la photo/ }).first();
    await opener.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("report listing dialog: labelled, Esc closes, focus returns", async ({ page }) => {
    const id = await firstId("/public/landing/providers?limit=1", (d) => (d.listings as Array<{ id: string }>)[0]?.id);
    test.skip(!id, "no published listing in the local data");
    await page.goto(`/prestataires/${id}`);
    const opener = page.getByRole("button", { name: "Signaler cette annonce" });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Signaler cette annonce" });
    await expect(dialog).toBeVisible();
    expect(await new AxeBuilder({ page }).include("dialog[open]").withTags(["wcag2a", "wcag2aa"]).analyze().then((r) => r.violations.map((v) => v.id))).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("mobile filters drawer: modal, Esc closes, focus returns", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) >= 1024, "drawer is for small screens");
    await page.goto("/catalogue");
    const opener = page.getByRole("button", { name: /^Filtres/ });
    await opener.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });
});

test.describe("form errors are announced and focused", () => {
  test("Boost form: empty submit focuses the first invalid field and announces errors", async ({ page }) => {
    await page.goto("/boost");
    const submit = page.getByRole("button", { name: /Envoyer la demande|Demander/ });
    test.skip((await submit.count()) === 0, "Boost sales closed in the local settings");
    await submit.first().click();
    await expect(page.getByRole("textbox", { name: /Nom de la boutique/ })).toBeFocused();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Nom de la boutique/ })).toHaveAttribute("aria-invalid", "true");
  });

  test("prestataire login: invalid submit is announced", async ({ page }) => {
    await page.goto("/espace-prestataire");
    const submit = page.getByRole("button", { name: /Recevoir|Continuer|Se connecter/ }).first();
    test.skip((await submit.count()) === 0, "login form not rendered");
    // Native constraint validation blocks an empty submit (no request, no email sent).
    await submit.click();
    const invalid = await page.evaluate(() => Array.from(document.querySelectorAll("input:invalid")).length);
    expect(invalid).toBeGreaterThan(0);
  });
});
