"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ListingForm, type OwnListing } from "@/components/providers/ListingForm";
import { AuthError, authFetch, clearSession, login, readSession, saveSession, verifyOtp, type PrestataireSession } from "@/features/providers/session";
import type { TradeDTO } from "@/services/api/schemas";

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Brouillon", tone: "neutral" },
  pending_review: { label: "En attente de validation", tone: "warning" },
  published: { label: "Publiée", tone: "success" },
  rejected: { label: "Refusée", tone: "danger" },
  hidden: { label: "Masquée", tone: "danger" },
  expired: { label: "Expirée", tone: "neutral" },
  deletion_requested: { label: "Suppression demandée", tone: "neutral" },
};

type Limits = { maxPhotos: number; maxVideos: number; photoMaxBytes: number; videoMaxBytes: number; videoMaxSeconds: number };

const subscribe = () => () => undefined;

function LoginPanel({ onLoggedIn }: { onLoggedIn: (s: PrestataireSession) => void }) {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const finish = (data: { accessToken: string; refreshToken?: string; user: PrestataireSession["user"] }) => {
    if (data.user.role !== "prestataire") {
      setError("Cet espace est réservé aux comptes prestataires. Les vendeurs et clients utilisent l'application WASSLA.");
      return;
    }
    const s = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user };
    saveSession(s);
    onLoggedIn(s);
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface-1 p-6 sm:p-8">
      <h2 className="text-xl font-semibold">Connexion prestataire</h2>
      <p className="mt-1 mb-6 text-sm text-text-secondary">Utilisez les identifiants de votre compte prestataire WASSLA.</p>
      {step === "credentials" ? (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const id = String(fd.get("identifier") ?? "").trim();
            setBusy(true);
            setError(null);
            try {
              const res = await login(id, String(fd.get("password") ?? ""));
              setIdentifier(id);
              if (res.accessToken && res.user) finish({ accessToken: res.accessToken, refreshToken: res.refreshToken, user: res.user });
              else setStep("otp");
            } catch (err) {
              setError(err instanceof AuthError ? err.message : "Connexion impossible pour le moment.");
            } finally {
              setBusy(false);
            }
          }}>
          <Input label="E-mail ou téléphone" name="identifier" required autoComplete="username" />
          <Input label="Mot de passe" name="password" type="password" required autoComplete="current-password" />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={busy} className="w-full">Continuer</Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const code = String(new FormData(e.currentTarget).get("otp") ?? "").trim();
            setBusy(true);
            setError(null);
            try {
              finish(await verifyOtp(identifier, code));
            } catch (err) {
              setError(err instanceof AuthError ? err.message : "Code invalide.");
            } finally {
              setBusy(false);
            }
          }}>
          <p className="text-sm text-text-secondary" role="status">Un code de vérification à 6 chiffres vient d&apos;être envoyé à l&apos;e-mail de votre compte.</p>
          <Input label="Code de vérification" name="otp" required inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={busy} className="w-full">Valider</Button>
          <button type="button" className="text-sm text-text-muted hover:text-text-primary" onClick={() => setStep("credentials")}>← Modifier les identifiants</button>
        </form>
      )}
      <p className="mt-6 text-xs text-text-muted">
        Pas encore de compte ? Créez un compte prestataire dans l&apos;<Link href="/telecharger" className="text-accent underline underline-offset-4 hover:decoration-2">application WASSLA</Link>.
      </p>
    </div>
  );
}

export function PrestataireSpace({ trades }: { trades: TradeDTO[] }) {
  const initialSession = useSyncExternalStore(subscribe, readSession, () => null);
  const [session, setSession] = useState<PrestataireSession | null>(null);
  const active = session ?? initialSession;
  const [listings, setListings] = useState<OwnListing[] | null>(null);
  const [canPublish, setCanPublish] = useState(false);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<OwnListing | "new" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await authFetch<{ listings: OwnListing[]; canPublish: boolean; mediaLimits: Limits }>("/provider-listings/mine");
      setListings(data.listings);
      setCanPublish(data.canPublish);
      setLimits(data.mediaLimits);
      setError(null);
    } catch (e) {
      if (e instanceof AuthError && e.status === 401) setSession(null);
      setError(e instanceof Error ? e.message : "Chargement impossible.");
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(id);
  }, [active, refresh]);

  if (!active || !readSession()) return <LoginPanel onLoggedIn={setSession} />;

  const act = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      setNotice(success);
      await refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Action impossible.");
    }
  };

  if (editing && limits) {
    const initial = editing === "new" ? undefined : editing;
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">{initial ? "Modifier l'annonce" : "Nouvelle annonce de prestation"}</h2>
        <ListingForm
          trades={trades}
          initial={initial}
          limits={limits}
          canPublish={canPublish}
          onCancel={() => setEditing(null)}
          onSubmit={async (form, submit) => {
            if (initial) {
              form.delete("action");
              await authFetch(`/provider-listings/${initial._id}`, { method: "PATCH", form });
              if (submit && ["draft", "rejected", "expired"].includes(initial.status)) await authFetch(`/provider-listings/${initial._id}/submit`, { method: "POST" });
            } else {
              await authFetch("/provider-listings", { method: "POST", form });
            }
            setEditing(null);
            setNotice(submit ? "Annonce envoyée. Elle sera visible après validation par l'équipe WASSLA." : "Brouillon enregistré.");
            await refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">Connecté : <strong className="text-text-primary">{active.user.firstName} {active.user.lastName}</strong></p>
        <div className="flex gap-2">
          <Button onClick={() => setEditing("new")} disabled={!limits}>Publier une annonce de prestation</Button>
          <Button variant="ghost" onClick={() => { clearSession(); setSession(null); setListings(null); }}>Se déconnecter</Button>
        </div>
      </div>
      {notice && <p role="status" className="rounded-md border border-border-strong bg-surface-2 p-3 text-sm">{notice}</p>}
      {!canPublish && listings && (
        <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          Votre abonnement prestataire n&apos;est pas actif : vous pouvez préparer des brouillons, mais pas les soumettre. Activez-le depuis l&apos;application WASSLA.
        </p>
      )}
      {error ? (
        <ErrorState description={error} onRetry={() => void refresh()} />
      ) : listings === null ? (
        <p role="status" className="text-sm text-text-muted">Chargement de vos annonces…</p>
      ) : listings.length === 0 ? (
        <EmptyState title="Vous n'avez pas encore d'annonce" description="Présentez vos prestations, vos réalisations en photo et vidéo, et soyez contacté directement par téléphone ou WhatsApp." action={<Button onClick={() => setEditing("new")}>Créer ma première annonce</Button>} />
      ) : (
        <ul className="space-y-4">
          {listings.map((l) => {
            const s = STATUS[l.status] ?? { label: l.status, tone: "neutral" as BadgeTone };
            return (
              <li key={l._id} className="rounded-xl border border-border bg-surface-1 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Badge tone={s.tone}>{s.label}</Badge>
                    <h3 className="pt-1 text-lg font-semibold">{l.title}</h3>
                    <p className="text-sm text-text-secondary">{l.businessName} · {l.wilaya}</p>
                    {l.rejectionReason && l.status === "rejected" && <p className="text-sm text-danger">Motif : {l.rejectionReason}</p>}
                  </div>
                  {l.stats && (
                    <dl className="grid grid-cols-3 gap-4 text-center">
                      <div><dt className="text-[11px] text-text-muted">Vues</dt><dd className="tabular font-semibold">{l.stats.views}</dd></div>
                      <div><dt className="text-[11px] text-text-muted">Appels</dt><dd className="tabular font-semibold">{l.stats.callClicks}</dd></div>
                      <div><dt className="text-[11px] text-text-muted">WhatsApp</dt><dd className="tabular font-semibold">{l.stats.whatsappClicks}</dd></div>
                    </dl>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {l.status === "published" && <Link href={`/prestataires/${l._id}`} className={buttonClasses("secondary")}>Voir l&apos;annonce</Link>}
                  {!["hidden", "deletion_requested"].includes(l.status) && <Button variant="secondary" onClick={() => setEditing(l)}>Modifier</Button>}
                  {["draft", "rejected", "expired"].includes(l.status) && canPublish && (
                    <Button variant="secondary" onClick={() => act(() => authFetch(`/provider-listings/${l._id}/submit`, { method: "POST" }), "Annonce soumise pour validation.")}>Soumettre</Button>
                  )}
                  {l.status === "published" && (
                    <Button variant="ghost" onClick={() => act(() => authFetch(`/provider-listings/${l._id}/promotion-request`, { method: "POST", json: {} }), "Demande de mise en avant envoyée. L'équipe WASSLA vous contactera pour le paiement.")}>Demander une mise en avant</Button>
                  )}
                  {l.status !== "deletion_requested" && (
                    <Button variant="ghost" onClick={() => { if (window.confirm("Demander la suppression de cette annonce ? Votre compte et vos autres annonces ne sont pas concernés.")) void act(() => authFetch(`/provider-listings/${l._id}/request-deletion`, { method: "POST", json: {} }), "Suppression demandée."); }}>
                      Demander la suppression
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
