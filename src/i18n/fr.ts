/**
 * All user-facing strings (French, default locale). Arabic will be added as
 * src/i18n/ar.ts with the same shape; layouts already use logical CSS
 * properties so RTL only needs dir="rtl".
 */
export const fr = {
  meta: {
    title: "WASSLA — Pièces auto, moto, poids lourds et prestataires en Algérie",
    titleTemplate: "%s · WASSLA",
    description:
      "Trouvez des pièces automobiles, motos et poids lourds auprès de vendeurs en Algérie, et contactez des prestataires automobiles près de chez vous.",
  },
  a11y: {
    skipToContent: "Aller au contenu",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    mainNav: "Navigation principale",
    footerNav: "Liens du pied de page",
    loading: "Chargement",
  },
  nav: {
    home: "Accueil",
    parts: "Pièces",
    automobile: "Automobile",
    moto: "Motos",
    heavy: "Poids lourds",
    providers: "Prestataires",
    boost: "Boost",
    contact: "Contact",
    downloadApp: "Télécharger l'app",
  },
  hero: {
    title: "Votre univers automobile, à portée de main.",
    subtitle:
      "Pièces auto, moto et poids lourds auprès de vendeurs partout en Algérie — et les prestataires qui interviennent près de chez vous.",
    searchLabel: "Rechercher une pièce",
    searchPlaceholder: "Pièce, réf. ou VIN…",
    searchSubmit: "Rechercher",
    ctaParts: "Explorer les pièces",
    ctaProviders: "Découvrir les prestataires",
  },
  story: {
    sectionLabel: "Découvrir WASSLA en quatre chapitres",
    automobile: {
      kicker: "01 · Automobile",
      title: "Chaque pièce, à sa juste place.",
      body: "Disques, étriers, plaquettes, moyeux… Recherchez par nom, par référence constructeur ou par numéro VIN, et comparez les annonces des vendeurs.",
      parts: ["Disque ventilé", "Étrier", "Plaquettes", "Moyeu"],
      cta: "Voir les pièces automobile",
    },
    moto: {
      kicker: "02 · Motos",
      title: "Pour les deux-roues et les quads.",
      body: "Transmission, freinage, entretien : des pièces pour motos, scooters et quads, classées par type de véhicule, marque et modèle.",
      cta: "Voir les pièces moto",
    },
    heavy: {
      kicker: "03 · Poids lourds",
      title: "Taillé pour les poids lourds.",
      body: "Camions et tracteurs routiers, bus, remorques et semi-remorques : moteur, turbo, freinage, suspension.",
      cta: "Voir les pièces poids lourds",
    },
    marketplace: {
      kicker: "04 · Marketplace",
      title: "Des annonces réelles, publiées par des vendeurs.",
      body: "Parcourez le catalogue sur le web, puis commandez et suivez votre livraison dans l'application WASSLA.",
      cta: "Ouvrir le catalogue",
    },
  },
  categories: {
    automobile: { title: "Automobile", description: "Moteur, freinage, carrosserie, électricité…" },
    moto: { title: "Motos", description: "Motos, scooters et quads." },
    heavy: { title: "Poids lourds", description: "Camions, bus, remorques et semi-remorques." },
  },
  badges: {
    sponsored: "Sponsorisé",
    advertisement: "Publicité",
    demo: "DONNÉES DE DÉMONSTRATION",
  },
  states: {
    emptyTitle: "Rien à afficher pour le moment",
    errorTitle: "Impossible de charger les données",
    errorDescription: "Vérifiez votre connexion puis réessayez.",
    retry: "Réessayer",
    resetFilters: "Réinitialiser les filtres",
  },
  store: {
    googlePlay: "Disponible sur Google Play",
    appStore: "Disponible sur l'App Store",
  },
  footer: {
    legal: "Mentions légales",
    privacy: "Confidentialité",
    terms: "CGU",
    rights: "Tous droits réservés.",
  },
} as const;

export type Messages = typeof fr;
