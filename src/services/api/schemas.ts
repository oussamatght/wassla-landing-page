import { z } from "zod";

/**
 * Zod schemas for the backend public landing DTOs. Every response is validated.
 */

export const sectorSchema = z.enum(["automobile", "moto", "poids_lourd"]);
export const interventionSchema = z.enum(["domicile", "lieu_de_travail", "atelier", "mobile"]);
export const pricingSchema = z.object({
  kind: z.enum(["fixed", "from", "quote", "undisclosed"]),
  amountDA: z.number().optional().nullable(),
});

export const productCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  priceDA: z.number(),
  condition: z.enum(["new", "used"]),
  sector: sectorSchema.catch("automobile"),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  reference: z.string().optional(),
  brand: z.string().optional(),
  sellerName: z.string().optional(),
  wilaya: z.string().optional(),
  inStock: z.boolean(),
  sponsored: z.boolean(),
  createdAt: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  pages: z.number(),
});

export const productListSchema = z.object({
  products: z.array(productCardSchema),
  pagination: paginationSchema,
  searchedAsVin: z.boolean().optional(),
});

const vehicleDetailsSchema = z
  .object({
    vehicleKind: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    displacementCc: z.number().optional(),
    engine: z.string().optional(),
    powerHp: z.number().optional(),
    manufacturerReference: z.string().optional(),
    serialNumber: z.string().optional(),
  })
  .partial();

export const productDetailSchema = productCardSchema.extend({
  description: z.string(),
  images: z.array(z.string().url()),
  oemReference: z.string().optional(),
  manufacturerRef: z.string().optional(),
  partName: z.string().optional(),
  engineCodes: z.array(z.string()).default([]),
  compatibleVehicles: z
    .array(
      z.object({
        brand: z.string().optional(),
        model: z.string().optional(),
        yearFrom: z.number().optional().nullable(),
        yearTo: z.number().optional().nullable(),
        engine: z.string().optional().nullable(),
      }),
    )
    .default([]),
  motoDetails: vehicleDetailsSchema.optional(),
  heavyVehicleDetails: vehicleDetailsSchema.optional(),
  seller: z
    .object({
      name: z.string().optional(),
      wilaya: z.string().optional(),
      rating: z.object({ average: z.number(), count: z.number() }).optional(),
    })
    .optional(),
  updatedAt: z.string().optional(),
});

export const statsSchema = z.object({
  products: z.number(),
  sellers: z.number(),
  wilayas: z.number(),
  providers: z.number(),
  computedAt: z.string().optional(),
});

export const settingsSchema = z.object({
  hero: z.object({ title: z.string().optional(), subtitle: z.string().optional() }),
  sections: z.array(z.object({ key: z.string(), enabled: z.boolean(), order: z.number() })),
  flags: z.record(z.string(), z.boolean()),
  boost: z.object({
    salesEnabled: z.boolean(),
    whatsappNumber: z.string().optional(),
    paymentInstructions: z.string().optional(),
  }),
  providerPromotion: z.object({
    enabled: z.boolean(),
    priceDA: z.number().optional(),
    durationDays: z.number().optional(),
  }),
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const tradeSchema = z.object({
  key: z.string(),
  label: z.string(),
  group: z.string().optional(),
  examples: z.string().optional(),
});

export const providerCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  businessName: z.string(),
  trade: z.string(),
  tradeLabel: z.string(),
  wilaya: z.string(),
  commune: z.string().optional(),
  vehicleTypes: z.array(sectorSchema),
  interventionModes: z.array(interventionSchema),
  pricing: pricingSchema,
  coverImageUrl: z.string().url().optional(),
  promoted: z.boolean(),
  publishedAt: z.string().optional(),
});

export const providerListSchema = z.object({
  promoted: z.array(providerCardSchema),
  listings: z.array(providerCardSchema),
  pagination: paginationSchema,
});

export const providerDetailSchema = providerCardSchema.extend({
  description: z.string(),
  photos: z.array(z.object({ id: z.string(), url: z.string().url() })),
  videos: z.array(z.object({ id: z.string(), url: z.string().url(), durationSec: z.number().optional() })),
  phone: z.string(),
  whatsapp: z.string(),
  coverageArea: z.string().optional(),
  travelFeeNote: z.string().optional(),
  availability: z
    .object({ days: z.array(z.string()).optional(), from: z.string().optional(), to: z.string().optional() })
    .optional(),
  updatedAt: z.string().optional(),
});

export const boostPackSchema = z.object({
  id: z.string(),
  name: z.string(),
  credits: z.number(),
  priceDA: z.number(),
  durationDays: z.number(),
});

export const boostPacksSchema = z.object({
  salesEnabled: z.boolean(),
  whatsappNumber: z.string().optional(),
  paymentInstructions: z.string().optional(),
  packs: z.array(boostPackSchema),
});

export const boostOrderSchema = z.object({
  reference: z.string(),
  status: z.string(),
  pack: z.object({ name: z.string(), credits: z.number(), priceDA: z.number(), durationDays: z.number() }),
  shopName: z.string().optional(),
  createdAt: z.string().optional(),
  rejectionReason: z.string().optional(),
  validatedAt: z.string().optional(),
});

export type ProductCardDTO = z.infer<typeof productCardSchema>;
export type ProductDetailDTO = z.infer<typeof productDetailSchema>;
export type ProductListDTO = z.infer<typeof productListSchema>;
export type StatsDTO = z.infer<typeof statsSchema>;
export type SettingsDTO = z.infer<typeof settingsSchema>;
export type TradeDTO = z.infer<typeof tradeSchema>;
export type ProviderCardDTO = z.infer<typeof providerCardSchema>;
export type ProviderListDTO = z.infer<typeof providerListSchema>;
export type ProviderDetailDTO = z.infer<typeof providerDetailSchema>;
export type BoostPacksDTO = z.infer<typeof boostPacksSchema>;
export type BoostOrderDTO = z.infer<typeof boostOrderSchema>;
