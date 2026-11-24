/**
 * Editorial copy for content pages. Feature claims are limited to what the
 * mobile app implements: VIN scan, cart & checkout with delivery quote, live order
 * tracking, returns, service booking, seller / driver / prestataire spaces.
 */
export const APP_FEATURES = [
  { title: "Recherche par VIN et référence", body: "Scannez le numéro VIN de votre véhicule ou tapez une référence OEM pour trouver des pièces compatibles.", source: "app/scan-vin.tsx" },
  { title: "Panier et livraison chiffrée", body: "Le prix de la livraison est calculé avant la commande selon l'itinéraire entre le vendeur et vous.", source: "app/checkout.tsx" },
  { title: "Suivi de livraison en direct", body: "Suivez le livreur sur la carte, de la récupération chez le vendeur jusqu'à votre porte.", source: "app/orders/tracking.tsx" },
  { title: "Retours encadrés", body: "Demandez un retour sur une ligne de commande, avec photos, et suivez chaque étape.", source: "app/returns/index.tsx" },
  { title: "Prestataires et rendez-vous", body: "Réservez un prestataire (mécanique, diagnostic, lavage…) et suivez son arrivée.", source: "app/service/book.tsx" },
  { title: "Espaces vendeur, livreur et prestataire", body: "Gestion des produits et du stock, des livraisons et des gains, ou des prestations.", source: "app/seller, app/(driver), app/service/manage.tsx" },
] as const;

export const FAQ = [
  {
    q: "WASSLA, comment ça marche ?",
    a: "WASSLA met en relation des acheteurs et des vendeurs de pièces auto, moto et poids lourds partout en Algérie. Vous trouvez une pièce, vous la commandez dans l'application, et un livreur la récupère chez le vendeur pour vous la livrer.",
  },
  {
    q: "Puis-je acheter directement sur le site ?",
    a: "Le site permet de rechercher et de consulter les annonces. La commande, le paiement et le suivi de livraison se font dans l'application WASSLA, disponible sur Google Play et l'App Store.",
  },
  {
    q: "Comment savoir si une pièce est compatible avec mon véhicule ?",
    a: "Recherchez par numéro VIN ou par référence constructeur (OEM), et vérifiez la compatibilité indiquée par le vendeur. En cas de doute, comparez toujours la référence avec celle de votre pièce d'origine avant de commander.",
  },
  {
    q: "Combien coûte la livraison ?",
    a: "Le prix est calculé avant la commande, selon la distance et la durée du trajet entre le vendeur et votre adresse. Il s'affiche dans l'application avant que vous ne validiez.",
  },
  {
    q: "Puis-je retourner une pièce ?",
    a: "Oui, une demande de retour peut être faite depuis la commande dans l'application, selon les conditions affichées (délai, motif, état de la pièce). Chaque étape est suivie et un remboursement éventuel est traité par WASSLA.",
  },
  {
    q: "Publier des annonces de pièces est-il payant ?",
    a: "Non, publier vos produits est gratuit. Le Boost est une option payante qui améliore leur visibilité dans les emplacements sponsorisés, sans garantie de ventes.",
  },
  {
    q: "Je suis prestataire, comment apparaître sur WASSLA ?",
    a: "Créez un compte prestataire dans l'application, activez votre abonnement, puis publiez vos annonces depuis l'espace prestataire du site ou de l'application. Chaque annonce est vérifiée avant publication.",
  },
  {
    q: "Comment contacter un prestataire ?",
    a: "Depuis son annonce, appelez-le ou écrivez-lui sur WhatsApp. Le prestataire confirme lui-même sa disponibilité, son tarif et ses frais de déplacement.",
  },
] as const;
