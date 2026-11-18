/**
 * Part categories accepted by the backend, labelled as in the mobile app.
 */
export const PART_CATEGORIES: ReadonlyArray<{ value: string; label: string; group: "classic" | "pro" }> = [
  { value: "moteur", label: "Moteur", group: "classic" },
  { value: "freinage", label: "Freinage", group: "classic" },
  { value: "suspension", label: "Suspension", group: "classic" },
  { value: "transmission", label: "Transmission", group: "classic" },
  { value: "electrique", label: "Électrique", group: "classic" },
  { value: "electronique", label: "Électronique", group: "classic" },
  { value: "mecatronique", label: "Mécatronique", group: "classic" },
  { value: "carrosserie", label: "Carrosserie", group: "classic" },
  { value: "interieur", label: "Intérieur", group: "classic" },
  { value: "echappement", label: "Échappement", group: "classic" },
  { value: "refroidissement", label: "Refroidissement", group: "classic" },
  { value: "filtres", label: "Filtres", group: "classic" },
  { value: "pneumatique", label: "Pneumatique", group: "classic" },
  { value: "accessoires", label: "Accessoires", group: "classic" },
  { value: "autre", label: "Autre", group: "classic" },
  { value: "moteur_interne", label: "Bloc moteur (interne)", group: "pro" },
  { value: "distribution", label: "Distribution & entraînement", group: "pro" },
  { value: "injection_carburation", label: "Injection / carburation", group: "pro" },
  { value: "echappement_depollution", label: "Échappement & dépollution", group: "pro" },
  { value: "refroidissement_lubrification", label: "Refroidissement & lubrification", group: "pro" },
  { value: "electrique_allumage", label: "Électricité & allumage", group: "pro" },
  { value: "transmission_embrayage", label: "Transmission & embrayage", group: "pro" },
  { value: "freinage_pro", label: "Système de freinage", group: "pro" },
  { value: "suspension_direction", label: "Suspension & direction", group: "pro" },
  { value: "carrosserie_ext", label: "Carrosserie extérieure", group: "pro" },
  { value: "vitrage", label: "Vitrage & visibilité", group: "pro" },
  { value: "eclairage", label: "Éclairage & signalisation", group: "pro" },
  { value: "habitacle", label: "Habitacle & confort", group: "pro" },
  { value: "climatisation", label: "Climatisation & chauffage", group: "pro" },
  { value: "pneumatiques_roues", label: "Roues & pneumatiques", group: "pro" },
];

export function categoryLabel(value?: string): string | undefined {
  return value ? PART_CATEGORIES.find((c) => c.value === value)?.label ?? value : undefined;
}
