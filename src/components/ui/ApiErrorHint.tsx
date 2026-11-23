import "server-only";
import { serverApiUrl } from "@/lib/env";
import type { Loaded } from "@/services/data-source";

/**
 * Developer-only diagnostics for a failed API call. Rendered only when
 * NODE_ENV !== "production", so visitors never see internal URLs.
 */
export function ApiErrorHint({ error }: { error: Loaded<unknown>["error"] }) {
  if (process.env.NODE_ENV === "production" || !error) return null;
  const base = serverApiUrl();
  const unreachable = error.kind === "network" || error.kind === "timeout";
  return (
    <div className="w-full max-w-xl rounded-md border border-border bg-surface-1 p-4 text-left font-mono text-xs leading-relaxed text-text-secondary">
      <p className="mb-1 font-semibold text-text-primary">Diagnostic (développement uniquement)</p>
      <p>API : {base}</p>
      <p>
        Erreur : {error.kind}
        {error.status ? ` · HTTP ${error.status}` : ""} · {error.message}
      </p>
      {unreachable && (
        <p className="mt-2">
          Aucun backend ne répond à cette adresse. Démarrez le backend local (base de test), ou définissez
          {" "}NEXT_PUBLIC_WASSLA_API_URL / WASSLA_API_URL dans .env.local, puis redémarrez « npm run dev ».
        </p>
      )}
      {error.status === 404 && <p className="mt-2">La route n&apos;existe pas sur ce backend : vérifiez qu&apos;il contient les routes /api/public/landing (version déployée).</p>}
      {error.kind === "validation" && <p className="mt-2">La réponse ne correspond pas au schéma attendu (src/services/api/schemas.ts).</p>}
    </div>
  );
}
