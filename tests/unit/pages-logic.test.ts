import { describe, expect, it } from "vitest";
import { activeFilterCount, hrefWith, parseCatalogueParams } from "@/features/catalogue/params";
import { productCardSchema, providerDetailSchema, boostPacksSchema } from "@/services/api/schemas";
import { toProviderSummary } from "@/services/api/adapters";
import { pricingLabel } from "@/lib/labels";
import { formatPhoneDisplay } from "@/lib/format";
import { WILAYAS } from "@/lib/wilayas";
import { PART_CATEGORIES } from "@/lib/categories";
import { CATALOGUE_LINKS, HEADER_LINKS, MOBILE_EXTRA_LINKS, isActivePath, isCatalogueSection } from "@/components/layout/nav-items";

describe("catalogue URL state", () => {
  it("keeps known values and drops unknown or malformed ones", () => {
    const q = parseCatalogueParams({ q: " filtre ", sector: "moto", category: "freinage", wilaya: "Oran", condition: "used", priceMin: "100", priceMax: "9e9", sort: "price_asc", page: "3", inStock: "true" });
    expect(q).toMatchObject({ q: "filtre", sector: "moto", category: "freinage", wilaya: "Oran", condition: "used", priceMin: "100", sort: "price_asc", page: 3, inStock: "true" });
    expect(q.priceMax).toBeUndefined();
    const bad = parseCatalogueParams({ sector: "avion", category: "<script>", wilaya: "Paris", condition: "x", sort: "random", page: "-4" });
    expect(bad).toMatchObject({ sector: undefined, category: undefined, wilaya: undefined, condition: undefined, sort: undefined, page: 1 });
  });

  it("a category route fixes the sector regardless of the query", () => {
    expect(parseCatalogueParams({ sector: "moto" }, "poids_lourd").sector).toBe("poids_lourd");
  });

  it("builds shareable hrefs without empty values or page 1", () => {
    expect(hrefWith("/catalogue", { q: "disque", sector: undefined, page: 1, limit: 24 })).toBe("/catalogue?q=disque");
    expect(hrefWith("/catalogue", { q: "disque", wilaya: "Alger", page: 2 }, ["wilaya"])).toBe("/catalogue?q=disque&page=2");
    expect(hrefWith("/catalogue", {})).toBe("/catalogue");
  });

  it("counts active filters (sector only when it is a filter)", () => {
    const q = parseCatalogueParams({ sector: "moto", wilaya: "Oran", inStock: "true" });
    expect(activeFilterCount(q)).toBe(3);
    expect(activeFilterCount(parseCatalogueParams({ wilaya: "Oran" }, "moto"), "moto")).toBe(1);
  });
});

describe("reference data", () => {
  it("has the 58 backend wilayas and only backend product categories", () => {
    expect(WILAYAS).toHaveLength(58);
    expect(WILAYAS[0]).toBe("Adrar");
    expect(PART_CATEGORIES.map((c) => c.value)).not.toContain("voitures");
    expect(new Set(PART_CATEGORIES.map((c) => c.value)).size).toBe(PART_CATEGORIES.length);
  });
});

describe("API schemas and adapters", () => {
  it("accept backend DTOs and default unknown sectors to automobile", () => {
    const card = productCardSchema.parse({ id: "1", title: "A", priceDA: 100, condition: "new", sector: "bateau", inStock: true, sponsored: false });
    expect(card.sector).toBe("automobile");
    expect(() => productCardSchema.parse({ id: "1", title: "A", priceDA: "100", condition: "new", inStock: true, sponsored: false })).toThrow();
  });

  it("provider detail requires the business phone; adapter maps null amounts", () => {
    const detail = providerDetailSchema.parse({
      id: "l1", title: "T", businessName: "B", trade: "lavage-domicile", tradeLabel: "Lavage", wilaya: "Oran", vehicleTypes: ["automobile"],
      interventionModes: ["domicile"], pricing: { kind: "quote", amountDA: null }, promoted: false, description: "d", photos: [], videos: [], phone: "+213551234567", whatsapp: "+213551234567",
    });
    expect(toProviderSummary(detail).pricing).toEqual({ kind: "quote", amountDA: undefined });
  });

  it("boost packs schema", () => {
    expect(boostPacksSchema.parse({ salesEnabled: false, packs: [] }).packs).toEqual([]);
  });
});

describe("labels", () => {
  it("pricing and phone display", () => {
    expect(pricingLabel({ kind: "from", amountDA: 2500 })).toBe("À partir de 2 500 DA");
    expect(pricingLabel({ kind: "quote" })).toBe("Devis sur demande");
    expect(formatPhoneDisplay("+213551234567")).toBe("0551 23 45 67");
  });
});

describe("header navigation", () => {
  it("has no duplicate links and exposes the three sectors in the Catalogue dropdown", () => {
    const all = [...CATALOGUE_LINKS, ...HEADER_LINKS, ...MOBILE_EXTRA_LINKS].map((l) => l.href);
    expect(new Set(all).size).toBe(all.length);
    expect(CATALOGUE_LINKS.map((l) => l.href)).toEqual(["/catalogue", "/categories/automobile", "/categories/motos", "/categories/poids-lourds"]);
    expect(HEADER_LINKS.map((l) => l.href)).toEqual(expect.arrayContaining(["/prestataires", "/boost"]));
  });

  it("marks the right route active", () => {
    expect(isCatalogueSection("/categories/motos")).toBe(true);
    expect(isCatalogueSection("/products/abc")).toBe(true);
    expect(isCatalogueSection("/catalogue")).toBe(true);
    expect(isCatalogueSection("/prestataires")).toBe(false);
    expect(isActivePath("/prestataires/123", "/prestataires")).toBe(true);
    expect(isActivePath("/prestataires-x", "/prestataires")).toBe(false);
    expect(isActivePath("/boost", "/")).toBe(false);
  });
});

describe("prestataire session snapshot", () => {
  it("returns the same object while sessionStorage is unchanged (useSyncExternalStore contract)", async () => {
    const { readSession, saveSession, clearSession } = await import("@/features/providers/session");
    clearSession();
    expect(readSession()).toBeNull();
    saveSession({ accessToken: "t", user: { _id: "u1", role: "prestataire" } });
    const a = readSession();
    expect(a).not.toBeNull();
    expect(readSession()).toBe(a);
    saveSession({ accessToken: "t2", user: { _id: "u1", role: "prestataire" } });
    expect(readSession()).not.toBe(a);
    expect(readSession()?.accessToken).toBe("t2");
    clearSession();
    expect(readSession()).toBeNull();
  });
});
