"use client";

import { useState, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { AdBadge, Badge, SponsoredBadge } from "@/components/ui/Badge";
import { Chip, FilterChip, RemovableChip } from "@/components/ui/Chip";
import { Combobox } from "@/components/ui/Combobox";
import { Input, Select } from "@/components/ui/Field";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState, ErrorState, GridSkeleton, Skeleton } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { Drawer, Modal } from "@/components/ui/Dialog";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { StoreBadges } from "@/components/app-showcase/StoreBadges";
import { WILAYAS } from "@/lib/wilayas";
import { formatPriceDA } from "@/lib/format";
import { SAMPLE_PRODUCTS, SAMPLE_PROVIDER } from "@/fixtures/design-samples";

const SWATCHES = [
  ["navy-950", "--brand-navy-950"],
  ["navy-900", "--brand-navy-900"],
  ["cyan-400", "--brand-cyan-400"],
  ["blue-500", "--brand-blue-500"],
  ["violet-500", "--brand-violet-500"],
  ["lavender-300", "--brand-lavender-300"],
  ["surface-1", "--surface-1"],
  ["surface-2", "--surface-2"],
  ["surface-3", "--surface-3"],
  ["success", "--success"],
  ["warning", "--warning"],
  ["danger", "--danger"],
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-border pt-8">
      <h2 className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{title}</h2>
      {children}
    </section>
  );
}

function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => toast.show("Filtres appliqués", "success")}>
        Toast succès
      </Button>
      <Button variant="secondary" onClick={() => toast.show("La connexion au serveur a échoué", "error")}>
        Toast erreur
      </Button>
    </div>
  );
}

export function DesignPlayground() {
  const [selected, setSelected] = useState(true);
  const [wilaya, setWilaya] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6">
        <header className="space-y-3">
          <p className="font-mono text-xs tracking-[0.25em] text-text-muted">DEV ONLY · /design</p>
          <h1 className="text-4xl font-semibold">Système de design WASSLA</h1>
          <p className="max-w-2xl text-text-secondary">
            Chaque composant est construit une fois ici. Les cartes utilisent des exemples
            <strong> fictifs</strong> (préfixés « Exemple »), jamais servis sur le site public.
          </p>
        </header>

        <Section title="Couleurs">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {SWATCHES.map(([name, variable]) => (
              <li key={name} className="overflow-hidden rounded-md border border-border">
                <div className="h-14" style={{ background: `var(${variable})` }} />
                <p className="px-2 py-1.5 font-mono text-[11px] text-text-secondary">{name}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            <div className="bg-signature h-2 rounded-full" />
            <p className="text-xs text-text-muted">
              Dégradé signature (décoratif : lignes, états actifs, reflets). Les boutons utilisent sa
              variante profonde pour un contraste AA.
            </p>
          </div>
        </Section>

        <Section title="Typographie">
          <p className="font-display text-5xl font-semibold">Sora — Pièces auto</p>
          <p className="text-lg">Inter — Trouvez la bonne pièce, au bon prix, près de chez vous.</p>
          <p className="font-mono text-sm text-text-secondary">IBM Plex Mono — Réf. 1K0 698 151 · VIN WVWZZZ1KZAW000001</p>
          <p className="tabular font-display text-2xl">{formatPriceDA(12500)} · {formatPriceDA(1500)}</p>
        </Section>

        <Section title="Boutons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primaire</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="ghost">Fantôme</Button>
            <Button loading>Envoyer</Button>
            <Button disabled>Désactivé</Button>
            <Button size="lg">Grand</Button>
            <ButtonLink href="/catalogue" variant="secondary">
              Lien bouton
            </ButtonLink>
          </div>
        </Section>

        <Section title="Champs">
          <div className="grid gap-5 md:grid-cols-3">
            <Input label="Nom de la boutique" placeholder="Ex. Auto Pièces Blida" required />
            <Input label="Téléphone" placeholder="05 XX XX XX XX" error="Numéro algérien invalide (ex. 0551234567)." defaultValue="1234" />
            <Select
              label="État"
              placeholder="Tous"
              options={[
                { value: "new", label: "Neuf" },
                { value: "used", label: "Occasion" },
              ]}
            />
            <Combobox label="Wilaya" options={[...WILAYAS]} value={wilaya} onChange={setWilaya} placeholder="Toutes les wilayas" hint="58 wilayas (liste du backend)" />
          </div>
          <SearchBar className="max-w-2xl" />
          <SearchBar className="max-w-md" size="md" />
        </Section>

        <Section title="Badges et puces">
          <div className="flex flex-wrap items-center gap-2">
            <SponsoredBadge />
            <AdBadge />
            <Badge tone="accent">Neuf</Badge>
            <Badge>Occasion</Badge>
            <Badge tone="success">Validé</Badge>
            <Badge tone="warning">En attente</Badge>
            <Badge tone="danger">Refusé</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip>Moto</Chip>
            <FilterChip selected={selected} onClick={() => setSelected((v) => !v)}>
              En stock
            </FilterChip>
            <RemovableChip label="Wilaya : Alger" onRemove={() => undefined} />
          </div>
        </Section>

        <Section title="Cartes">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {SAMPLE_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            <div className="col-span-2 md:col-span-1">
              <ProviderCard listing={SAMPLE_PROVIDER} />
            </div>
          </div>
        </Section>

        <Section title="États">
          <div className="grid gap-4 md:grid-cols-2">
            <EmptyState
              title="Aucune pièce ne correspond à votre recherche"
              description="Essayez une autre référence ou retirez un filtre."
              action={<Button variant="secondary">Réinitialiser les filtres</Button>}
            />
            <ErrorState onRetry={() => undefined} />
          </div>
          <Skeleton className="h-4 w-48" />
          <GridSkeleton count={4} />
        </Section>

        <Section title="Pagination">
          <Pagination page={4} totalPages={12} hrefForPage={(p) => `/design?page=${p}`} />
        </Section>

        <Section title="Modale, tiroir, toast">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Ouvrir la modale
            </Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Ouvrir le tiroir (filtres mobile)
            </Button>
          </div>
          <ToastDemo />
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirmer la demande"
            description="Exemple de modale accessible (dialog natif)."
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setModalOpen(false)}>Confirmer</Button>
              </>
            }>
            <p className="text-sm text-text-secondary">Échap ferme la modale et rend le focus au bouton.</p>
          </Modal>
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Filtres"
            footer={
              <Button className="w-full" onClick={() => setDrawerOpen(false)}>
                Appliquer (24 résultats)
              </Button>
            }>
            <div className="space-y-4">
              <Combobox label="Wilaya" options={[...WILAYAS]} value={wilaya} onChange={setWilaya} />
            </div>
          </Drawer>
        </Section>

        <Section title="Badges des stores">
          <StoreBadges placement="design" />
        </Section>
      </div>
    </ToastProvider>
  );
}
