"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/services/api/endpoints";
import type { BoostOrderDTO, BoostPacksDTO } from "@/services/api/schemas";
import { publicEnv } from "@/lib/env";
import { formatPriceDA } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

const PHONE_RE = /^(?:0[5-7]\d{8}|\+213[5-7]\d{8}|00213[5-7]\d{8})$/;

function whatsappLink(number: string, order: BoostOrderDTO, sellerId: string, instructions?: string) {
  const text = [
    "Bonjour WASSLA,",
    `Je souhaite régler ma demande Boost ${order.reference}.`,
    `Boutique : ${order.shopName ?? ""}`,
    `ID vendeur : ${sellerId}`,
    `Pack : ${order.pack.name} — ${order.pack.credits} crédits`,
    `Montant : ${formatPriceDA(order.pack.priceDA)}`,
    instructions ? `\n${instructions}` : "",
    "Je vous envoie le justificatif de paiement.",
  ].filter(Boolean).join("\n");
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

/**
 * Boost purchase REQUEST (manual WhatsApp payment).
 * Creating the request never adds credits: only an admin validation does.
 */
export function BoostOrderForm({ boost }: { boost: BoostPacksDTO }) {
  const [packId, setPackId] = useState(boost.packs[0]?.id ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ order: BoostOrderDTO; sellerId: string; whatsapp?: string } | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  // The form is replaced by the confirmation: move focus there so keyboard and
  // screen-reader users land on the reference.
  useEffect(() => {
    if (result) resultHeading.current?.focus();
  }, [result]);

  if (!boost.salesEnabled || boost.packs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-1 p-6 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Bientôt disponible</p>
        <p className="mt-2 text-text-secondary">La vente des packs Boost ouvrira prochainement. Publier vos annonces reste gratuit dans l&apos;application.</p>
      </div>
    );
  }

  if (result) {
    const wa = result.whatsapp ?? boost.whatsappNumber;
    return (
      <div className="space-y-5 rounded-2xl border border-success/40 bg-success/5 p-6" role="status">
        <p className="font-mono text-xs tracking-[0.2em] text-success uppercase">Demande enregistrée</p>
        <h3 ref={resultHeading} tabIndex={-1} className="text-2xl font-semibold focus:outline-none">Référence <span className="font-mono">{result.order.reference}</span></h3>
        <p className="text-text-secondary">
          Statut : <strong className="text-text-primary">en attente de paiement</strong>. Vos crédits seront ajoutés uniquement après vérification du paiement par l&apos;équipe WASSLA.
        </p>
        <ol className="list-decimal space-y-1 ps-5 text-sm text-text-secondary">
          <li>Envoyez le justificatif de paiement sur WhatsApp en rappelant votre référence.</li>
          <li>L&apos;équipe vérifie le montant ({formatPriceDA(result.order.pack.priceDA)}) et valide la demande.</li>
          <li>Vos {result.order.pack.credits} crédits apparaissent dans votre espace vendeur ; 1 crédit = 1 produit boosté {result.order.pack.durationDays} jours.</li>
        </ol>
        {wa && (
          <a href={whatsappLink(wa, result.order, result.sellerId, boost.paymentInstructions)} target="_blank" rel="noopener noreferrer" className="bg-cta inline-flex min-h-12 items-center justify-center rounded-full px-6 font-semibold text-white">
            Envoyer le justificatif sur WhatsApp<span className="sr-only"> (nouvel onglet)</span>
          </a>
        )}
        <p className="text-xs text-text-muted">Conservez votre référence : elle permet de suivre la demande ci-dessous.</p>
      </div>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const shopName = String(fd.get("shopName") ?? "").trim();
    const sellerId = String(fd.get("sellerId") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").replace(/[\s.-]/g, "");
    const next: Record<string, string> = {};
    if (shopName.length < 2) next.shopName = "Indiquez le nom de votre boutique.";
    if (!/^[a-f0-9]{24}$/i.test(sellerId)) next.sellerId = "L'identifiant vendeur WASSLA comporte 24 caractères (lettres a–f et chiffres).";
    if (!PHONE_RE.test(phone)) next.phone = "Numéro algérien invalide : 05, 06 ou 07 suivi de 8 chiffres (ou +213).";
    if (!packId) next.pack = "Choisissez un pack.";
    setErrors(next);
    const firstInvalid = (["pack", "shopName", "sellerId", "phone"] as const).find((k) => next[k]);
    if (firstInvalid) {
      // Focus the first invalid field; its error is announced via role="alert".
      const el = event.currentTarget.elements.namedItem(firstInvalid);
      const target = el instanceof RadioNodeList ? (el[0] as HTMLElement | undefined) : (el as HTMLElement | null);
      target?.focus();
      return;
    }
    setBusy(true);
    setServerError(null);
    try {
      if (publicEnv.useFixtures) {
        const pack = boost.packs.find((p) => p.id === packId)!;
        setResult({ order: { reference: "WSL-BST-DEMO-000000", status: "AWAITING_PAYMENT", pack, shopName }, sellerId, whatsapp: boost.whatsappNumber });
      } else {
        const res = await api.createBoostOrder({ shopName, sellerId, phone, packId, website: String(fd.get("website") ?? "") || undefined });
        setResult({ order: res.order, sellerId, whatsapp: res.whatsappNumber });
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "La demande n'a pas pu être envoyée.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Choisissez un pack</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {boost.packs.map((p) => (
            <label key={p.id} className={cn("relative cursor-pointer rounded-xl border p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus", packId === p.id ? "border-accent bg-accent/5" : "border-border hover:border-border-strong")}>
              <input type="radio" name="pack" value={p.id} checked={packId === p.id} onChange={() => setPackId(p.id)} className="sr-only" />
              <span className="block font-semibold">{p.name}</span>
              <span className="tabular mt-1 block font-display text-2xl font-semibold">{formatPriceDA(p.priceDA)}</span>
              <span className="mt-1 block text-sm text-text-secondary">{p.credits} crédits · {p.durationDays} jours par produit</span>
              <span className="tabular mt-1 block text-xs text-text-muted">soit {formatPriceDA(p.priceDA / p.credits)} par crédit</span>
            </label>
          ))}
        </div>
        {errors.pack && <p role="alert" className="mt-2 text-xs text-danger">{errors.pack}</p>}
      </fieldset>
      <div className="grid gap-5 md:grid-cols-3">
        <Input label="Nom de la boutique" name="shopName" required maxLength={80} error={errors.shopName} />
        <Input label="ID vendeur WASSLA" name="sellerId" required maxLength={24} className="font-mono" error={errors.sellerId} hint="Identifiant de votre compte vendeur (24 caractères). Demandez-le au support WASSLA si besoin." />
        <Input label="Téléphone" name="phone" type="tel" required inputMode="tel" placeholder="0551 23 45 67" error={errors.phone} />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {serverError && <p role="alert" className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" size="lg" loading={busy}>Envoyer la demande</Button>
      <p className="text-xs text-text-muted">Aucun paiement en ligne : le règlement se fait hors ligne et est vérifié manuellement. Le Boost améliore la visibilité mais ne garantit ni ventes ni nombre d&apos;affichages.</p>
    </form>
  );
}

export function BoostStatusLookup() {
  const [state, setState] = useState<{ order?: BoostOrderDTO; error?: string; busy?: boolean }>({});
  const LABELS: Record<string, string> = {
    REQUEST_CREATED: "Demande créée",
    AWAITING_PAYMENT: "En attente de paiement",
    PROOF_RECEIVED: "Justificatif reçu — vérification en cours",
    PAYMENT_VALIDATED: "Paiement validé — crédits ajoutés",
    REJECTED: "Refusée",
    CANCELLED: "Annulée",
  };
  return (
    <form
      className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setState({ busy: true });
        try {
          const order = await api.boostOrderStatus(String(fd.get("reference") ?? "").trim().toUpperCase(), String(fd.get("phone") ?? "").replace(/\s/g, ""));
          setState({ order });
        } catch {
          setState({ error: "Aucune demande ne correspond à cette référence et ce numéro." });
        }
      }}>
      <Input label="Référence" name="reference" required placeholder="WSL-BST-2026-000123" className="font-mono" />
      <Input label="Téléphone utilisé" name="phone" type="tel" required />
      <Button type="submit" variant="secondary" loading={state.busy}>Suivre</Button>
      <div className="md:col-span-3" aria-live="polite">
        {state.order && (
          <p className="rounded-md border border-border-strong bg-surface-2 p-3 text-sm">
            <span className="font-mono">{state.order.reference}</span> — <strong>{LABELS[state.order.status] ?? state.order.status}</strong>
            {state.order.rejectionReason ? ` (${state.order.rejectionReason})` : ""}
          </p>
        )}
        {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      </div>
    </form>
  );
}
