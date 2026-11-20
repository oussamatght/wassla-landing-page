import type {
  BoostPacksDTO,
  ProductCardDTO,
  ProductDetailDTO,
  ProviderCardDTO,
  ProviderDetailDTO,
  SettingsDTO,
  StatsDTO,
  TradeDTO,
} from "@/services/api/schemas";

/**
 * DEV-ONLY DEMONSTRATION DATA (rule 8). Served only when
 * NEXT_PUBLIC_USE_FIXTURES=true (next dev), always under the
 * "DONNÉES DE DÉMONSTRATION" ribbon; `next build` refuses this mode.
 * Every title says "Démo" — none of these are real products or providers.
 */
const demoProduct = (i: number, extra: Partial<ProductCardDTO>): ProductCardDTO => ({
  id: `demo-${i}`,
  title: `Démo — pièce n°${i}`,
  priceDA: 2500 + i * 1350,
  condition: i % 3 === 0 ? "used" : "new",
  sector: "automobile",
  category: "freinage",
  reference: `DEMO-${1000 + i}`,
  sellerName: "Vendeur D.",
  wilaya: ["Alger", "Oran", "Blida", "Sétif", "Constantine"][i % 5],
  inStock: i % 4 !== 0,
  sponsored: false,
  ...extra,
});

export const FIXTURE_PRODUCTS: ProductCardDTO[] = [
  demoProduct(1, { title: "Démo — kit plaquettes avant" }),
  demoProduct(2, { title: "Démo — disque ventilé 280 mm", category: "freinage" }),
  demoProduct(3, { title: "Démo — chaîne 520 moto", sector: "moto", category: "transmission" }),
  demoProduct(4, { title: "Démo — turbo poids lourd", sector: "poids_lourd", category: "moteur" }),
  demoProduct(5, { title: "Démo — filtre à huile", category: "filtres" }),
  demoProduct(6, { title: "Démo — amortisseur arrière", category: "suspension" }),
  demoProduct(7, { title: "Démo — alternateur 12V", category: "electrique" }),
  demoProduct(8, { title: "Démo — rétroviseur gauche", category: "carrosserie" }),
];

export const FIXTURE_SPONSORED: ProductCardDTO[] = FIXTURE_PRODUCTS.slice(0, 4).map((p) => ({ ...p, sponsored: true }));

export const FIXTURE_PRODUCT_DETAIL: ProductDetailDTO = {
  ...FIXTURE_PRODUCTS[0]!,
  description: "Fiche de démonstration : aucune annonce réelle n'est affichée en mode démo.",
  images: [],
  engineCodes: ["DEMO1"],
  compatibleVehicles: [{ brand: "Marque démo", model: "Modèle démo", yearFrom: 2015, yearTo: 2020 }],
  seller: { name: "Vendeur D.", wilaya: "Alger" },
};

export const FIXTURE_STATS: StatsDTO = { products: 0, sellers: 0, wilayas: 0, providers: 0 };

export const FIXTURE_TRADES: TradeDTO[] = [
  { key: "diagnostic-domicile", label: "Diagnostic automobile à domicile", group: "Mécanique" },
  { key: "lavage-domicile", label: "Lavage à domicile", group: "Esthétique" },
  { key: "mecanicien-moto", label: "Mécanicien moto mobile", group: "Moto" },
];

const demoProvider = (i: number, extra: Partial<ProviderCardDTO>): ProviderCardDTO => ({
  id: `demo-p${i}`,
  title: `Démo — prestation n°${i}`,
  businessName: "Prestataire démo",
  trade: "diagnostic-domicile",
  tradeLabel: "Diagnostic automobile à domicile",
  wilaya: "Blida",
  vehicleTypes: ["automobile"],
  interventionModes: ["domicile"],
  pricing: { kind: "quote" },
  promoted: false,
  ...extra,
});

export const FIXTURE_PROVIDERS: ProviderCardDTO[] = [
  demoProvider(1, { title: "Démo — diagnostic à domicile", promoted: true, pricing: { kind: "from", amountDA: 2500 } }),
  demoProvider(2, { title: "Démo — lavage à domicile", trade: "lavage-domicile", tradeLabel: "Lavage à domicile", wilaya: "Alger" }),
  demoProvider(3, { title: "Démo — mécanicien moto", trade: "mecanicien-moto", tradeLabel: "Mécanicien moto mobile", vehicleTypes: ["moto"], interventionModes: ["mobile"] }),
];

export const FIXTURE_PROVIDER_DETAIL: ProviderDetailDTO = {
  ...FIXTURE_PROVIDERS[0]!,
  description: "Annonce de démonstration : le numéro ci-dessous n'appartient à personne.",
  photos: [],
  videos: [],
  phone: "+213550000000",
  whatsapp: "+213550000000",
};

export const FIXTURE_SETTINGS: SettingsDTO = {
  hero: {},
  sections: [],
  flags: {},
  boost: { salesEnabled: true, whatsappNumber: "+213550000000" },
  providerPromotion: { enabled: false },
  contact: {},
};

export const FIXTURE_BOOST: BoostPacksDTO = {
  salesEnabled: true,
  whatsappNumber: "+213550000000",
  packs: [
    { id: "demo-pack-5", name: "Pack 5 (démo)", credits: 5, priceDA: 1500, durationDays: 7 },
    { id: "demo-pack-10", name: "Pack 10 (démo)", credits: 10, priceDA: 2500, durationDays: 7 },
  ],
};
