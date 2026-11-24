"use client";

import { useState } from "react";
import { api } from "@/services/api/endpoints";
import { publicEnv } from "@/lib/env";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Field";

const REASONS = [
  { value: "wrong_info", label: "Informations incorrectes" },
  { value: "fraud", label: "Arnaque ou tentative de fraude" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "illegal", label: "Activité illégale" },
  { value: "duplicate", label: "Annonce en double" },
  { value: "other", label: "Autre" },
];

/** Visitor report. Reviewed by the WASSLA team. */
export function ReportListingForm({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reason) return;
    setState("sending");
    try {
      if (!publicEnv.useFixtures) {
        const website = (new FormData(event.currentTarget).get("website") as string) || undefined;
        await api.reportListing(listingId, { reason, message: message.trim() || undefined, website });
      }
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-text-muted underline-offset-4 hover:text-text-primary hover:underline">
        Signaler cette annonce
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Signaler cette annonce" description="Votre signalement est anonyme et sera examiné par l'équipe WASSLA.">
        {state === "sent" ? (
          <p role="status" className="text-sm text-success">Merci, votre signalement a bien été transmis.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Select label="Motif" required placeholder="Choisir un motif" options={REASONS} value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-message" className="text-sm font-medium">Précisions (facultatif)</label>
              <textarea id="report-message" maxLength={500} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-md border border-border bg-surface-1 px-3.5 py-2.5 text-base text-text-primary focus:border-accent focus:outline-none" />
            </div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            {state === "error" && <p role="alert" className="text-sm text-danger">L&apos;envoi a échoué. Réessayez dans un instant.</p>}
            <Button type="submit" loading={state === "sending"} disabled={!reason}>Envoyer le signalement</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
