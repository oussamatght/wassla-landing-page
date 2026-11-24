"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { WILAYAS } from "@/lib/wilayas";
import { INTERVENTION_LABELS, SECTOR_LABELS } from "@/lib/labels";
import type { TradeDTO } from "@/services/api/schemas";

export interface OwnListing {
  _id: string;
  title: string;
  businessName: string;
  trade: string;
  otherTradeLabel?: string;
  description: string;
  phone: string;
  whatsapp?: string;
  wilaya: string;
  commune?: string;
  coverageArea?: string;
  travelFeeNote?: string;
  interventionModes: string[];
  vehicleTypes: string[];
  availability?: { days?: string[]; from?: string; to?: string };
  pricing: { kind: string; amountDA?: number };
  photos: Array<{ _id: string; url: string }>;
  videos: Array<{ _id: string; url: string }>;
  status: string;
  rejectionReason?: string;
  stats?: { views: number; callClicks: number; whatsappClicks: number };
  promotion?: { requestStatus: string; endsAt?: string };
}

const DAYS = [["lun", "Lun"], ["mar", "Mar"], ["mer", "Mer"], ["jeu", "Jeu"], ["ven", "Ven"], ["sam", "Sam"], ["dim", "Dim"]] as const;
const PRICING = [
  { value: "quote", label: "Devis sur demande" },
  { value: "from", label: "À partir de…" },
  { value: "fixed", label: "Tarif fixe" },
  { value: "undisclosed", label: "Prix non communiqué" },
];

const localPhone = (e164?: string) => (e164?.startsWith("+213") ? "0" + e164.slice(4) : e164 ?? "");

interface ListingFormProps {
  trades: TradeDTO[];
  initial?: OwnListing;
  limits: { maxPhotos: number; maxVideos: number; photoMaxBytes: number; videoMaxBytes: number; videoMaxSeconds: number };
  canPublish: boolean;
  onSubmit: (form: FormData, submit: boolean) => Promise<void>;
  onCancel: () => void;
}

/** Create / edit a provider listing. Server re-validates everything. */
export function ListingForm({ trades, initial, limits, canPublish, onSubmit, onCancel }: ListingFormProps) {
  const [trade, setTrade] = useState(initial?.trade ?? "");
  const [pricingKind, setPricingKind] = useState(initial?.pricing.kind ?? "quote");
  const [sameWhatsapp, setSameWhatsapp] = useState(!initial?.whatsapp || initial.whatsapp === initial.phone);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"draft" | "submit" | null>(null);
  const existingPhotos = initial?.photos.length ?? 0;
  const existingVideos = initial?.videos.length ?? 0;

  const handle = async (event: React.FormEvent<HTMLFormElement>, submit: boolean) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget.closest("form")!;
    const fd = new FormData(form);
    const out = new FormData();
    for (const key of ["title", "businessName", "trade", "otherTradeLabel", "description", "phone", "wilaya", "commune", "coverageArea", "travelFeeNote"]) {
      const v = String(fd.get(key) ?? "").trim();
      if (v) out.set(key, v);
    }
    out.set("whatsapp", sameWhatsapp ? "same" : String(fd.get("whatsapp") ?? "").trim());
    out.set("interventionModes", JSON.stringify(fd.getAll("interventionModes")));
    out.set("vehicleTypes", JSON.stringify(fd.getAll("vehicleTypes")));
    const days = fd.getAll("days").map(String);
    const from = String(fd.get("from") ?? "");
    const to = String(fd.get("to") ?? "");
    if (days.length || from || to) out.set("availability", JSON.stringify({ days, ...(from ? { from } : {}), ...(to ? { to } : {}) }));
    const amount = String(fd.get("amountDA") ?? "").trim();
    out.set("pricing", JSON.stringify({ kind: pricingKind, ...(amount && ["fixed", "from"].includes(pricingKind) ? { amountDA: Number(amount) } : {}) }));

    const photos = (fd.getAll("photos") as File[]).filter((f) => f.size > 0);
    const videos = (fd.getAll("videos") as File[]).filter((f) => f.size > 0);
    if (existingPhotos + photos.length > limits.maxPhotos) return setError(`${limits.maxPhotos} photos maximum par annonce.`);
    if (existingVideos + videos.length > limits.maxVideos) return setError(`${limits.maxVideos} vidéos maximum par annonce.`);
    if (photos.some((f) => f.size > limits.photoMaxBytes)) return setError("Chaque photo doit faire au plus 5 Mo.");
    if (videos.some((f) => f.size > limits.videoMaxBytes)) return setError("Chaque vidéo doit faire au plus 30 Mo.");
    photos.forEach((f) => out.append("photos", f));
    videos.forEach((f) => out.append("videos", f));
    if (submit) out.set("action", "submit");

    setBusy(submit ? "submit" : "draft");
    try {
      await onSubmit(out, submit);
    } catch (e) {
      setError(e instanceof Error ? e.message : "L'enregistrement a échoué.");
    } finally {
      setBusy(null);
    }
  };

  const groups = Array.from(new Set(trades.map((t) => t.group ?? "Autre")));

  return (
    <form onSubmit={(e) => handle(e, true)} className="space-y-8" noValidate={false}>
      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">L&apos;annonce</legend>
        <Input label="Nom de l'annonce" name="title" required minLength={3} maxLength={90} defaultValue={initial?.title} placeholder="Ex. Lavage auto à domicile" />
        <Input label="Nom du prestataire / entreprise" name="businessName" required maxLength={80} defaultValue={initial?.businessName} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lf-trade" className="text-sm font-medium">Métier <span aria-hidden="true" className="text-danger">*</span></label>
          <select id="lf-trade" name="trade" required value={trade} onChange={(e) => setTrade(e.target.value)} className="min-h-11 rounded-md border border-border bg-surface-1 px-3.5 text-base">
            <option value="">Choisir un métier</option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {trades.filter((t) => (t.group ?? "Autre") === g).map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        {trade === "autre" && <Input label="Précisez votre métier" name="otherTradeLabel" required maxLength={60} defaultValue={initial?.otherTradeLabel} />}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="lf-desc" className="text-sm font-medium">Description du travail <span aria-hidden="true" className="text-danger">*</span></label>
          <textarea id="lf-desc" name="description" required minLength={30} maxLength={3000} rows={6} defaultValue={initial?.description} aria-describedby="lf-desc-hint" className="rounded-md border border-border bg-surface-1 px-3.5 py-2.5 text-base focus:border-accent focus:outline-none" />
          <p id="lf-desc-hint" className="text-xs text-text-muted">Prestations, expérience, équipements, conditions d&apos;intervention, tarifs indicatifs (30 à 3000 caractères).</p>
        </div>
      </fieldset>

      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Contact</legend>
        <Input label="Téléphone" name="phone" type="tel" required inputMode="tel" defaultValue={localPhone(initial?.phone)} placeholder="0551 23 45 67" hint="Numéro algérien, affiché sur l'annonce." />
        <div className="space-y-2">
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={sameWhatsapp} onChange={(e) => setSameWhatsapp(e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
            Même numéro sur WhatsApp
          </label>
          {!sameWhatsapp && <Input label="Numéro WhatsApp" name="whatsapp" type="tel" inputMode="tel" defaultValue={localPhone(initial?.whatsapp)} />}
        </div>
      </fieldset>

      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Zone et intervention</legend>
        <Select label="Wilaya" name="wilaya" required placeholder="Choisir" defaultValue={initial?.wilaya ?? ""} options={WILAYAS.map((w) => ({ value: w, label: w }))} />
        <Input label="Commune" name="commune" maxLength={60} defaultValue={initial?.commune} />
        <Input label="Zone couverte" name="coverageArea" maxLength={200} defaultValue={initial?.coverageArea} placeholder="Ex. Blida centre et 20 km alentour" />
        <Input label="Frais de déplacement" name="travelFeeNote" maxLength={200} defaultValue={initial?.travelFeeNote} placeholder="Ex. Gratuit à moins de 10 km" />
        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-sm font-medium">Mode d&apos;intervention *</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(INTERVENTION_LABELS).map(([k, v]) => (
              <label key={k} className="relative"><input type="checkbox" name="interventionModes" value={k} defaultChecked={initial?.interventionModes.includes(k)} className="peer sr-only" /><span className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-border px-4 text-sm peer-checked:border-accent peer-checked:bg-accent/10 peer-focus-visible:outline-2 peer-focus-visible:outline-focus">{v}</span></label>
            ))}
          </div>
        </fieldset>
        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-sm font-medium">Véhicules pris en charge *</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SECTOR_LABELS).map(([k, v]) => (
              <label key={k} className="relative"><input type="checkbox" name="vehicleTypes" value={k} defaultChecked={initial?.vehicleTypes.includes(k)} className="peer sr-only" /><span className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-border px-4 text-sm peer-checked:border-accent peer-checked:bg-accent/10 peer-focus-visible:outline-2 peer-focus-visible:outline-focus">{v}</span></label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Disponibilités et tarifs (facultatif)</legend>
        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-sm font-medium">Jours</legend>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(([k, v]) => (
              <label key={k} className="relative"><input type="checkbox" name="days" value={k} defaultChecked={initial?.availability?.days?.includes(k)} className="peer sr-only" /><span className="inline-flex min-h-10 min-w-12 cursor-pointer items-center justify-center rounded-full border border-border px-3 text-sm peer-checked:border-accent peer-checked:bg-accent/10 peer-focus-visible:outline-2 peer-focus-visible:outline-focus">{v}</span></label>
            ))}
          </div>
        </fieldset>
        <Input label="De" name="from" type="time" defaultValue={initial?.availability?.from} />
        <Input label="À" name="to" type="time" defaultValue={initial?.availability?.to} />
        <Select label="Tarif" name="pricingKind" value={pricingKind} onChange={(e) => setPricingKind(e.target.value)} options={PRICING} />
        {["fixed", "from"].includes(pricingKind) && <Input label="Montant (DA)" name="amountDA" required inputMode="numeric" pattern="\d*" defaultValue={initial?.pricing.amountDA} />}
      </fieldset>

      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Photos et vidéos</legend>
        <Input label={`Photos (${existingPhotos}/${limits.maxPhotos})`} name="photos" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple hint="JPEG, PNG, WEBP ou HEIC — 5 Mo max chacune." />
        <Input label={`Vidéos (${existingVideos}/${limits.maxVideos})`} name="videos" type="file" accept="video/mp4,video/quicktime,video/webm" multiple hint={`MP4, MOV ou WEBM — 30 Mo et ${limits.videoMaxSeconds} s max.`} />
      </fieldset>

      {error && <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      {!canPublish && (
        <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          Un abonnement prestataire actif est nécessaire pour soumettre l&apos;annonce. Vous pouvez l&apos;enregistrer en brouillon et activer votre abonnement depuis l&apos;application.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={busy === "submit"} disabled={!canPublish || busy !== null}>Soumettre pour validation</Button>
        <Button type="button" variant="secondary" loading={busy === "draft"} disabled={busy !== null} onClick={(e) => handle(e as unknown as React.FormEvent<HTMLFormElement>, false)}>Enregistrer le brouillon</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}
