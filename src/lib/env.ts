/**
 * Public, build-time environment. Values are inlined by Next at build time,
 * so they must be read through literal `process.env.NEXT_PUBLIC_*` accesses.
 *
 * Deliberately dependency-free (no zod): this module reaches the client bundle
 * of every page (footer store badges → analytics → flags), and zod alone added
 * ~110 KB of JavaScript there. Same rules as before: URLs must parse, flags are
 * "true"/"false", anything else throws at startup.
 */
export interface PublicEnv {
  siteUrl: string;
  apiUrl: string;
  useFixtures: boolean;
  googleMapsEmbedKey?: string;
  flags: {
    story3d: boolean;
    boostSales: boolean;
    ads: boolean;
    editorial: boolean;
    providers: boolean;
    analytics: boolean;
  };
}

function url(name: string, value: string | undefined, fallback: string, issues: string[]): string {
  const v = value || fallback;
  try {
    new URL(v);
  } catch {
    issues.push(`${name} Invalid URL`);
  }
  return v;
}

function flag(name: string, value: string | undefined, issues: string[]): boolean {
  if (value === undefined) return false;
  if (value !== "true" && value !== "false") issues.push(`${name} Invalid option: expected "true" | "false"`);
  return value === "true";
}

function readPublicEnv(): PublicEnv {
  const issues: string[] = [];
  const env: PublicEnv = {
    siteUrl: url("siteUrl", process.env.NEXT_PUBLIC_SITE_URL || undefined, "http://localhost:3000", issues),
    apiUrl: url("apiUrl", process.env.NEXT_PUBLIC_WASSLA_API_URL || undefined, "http://127.0.0.1:5000/api", issues),
    useFixtures: flag("useFixtures", process.env.NEXT_PUBLIC_USE_FIXTURES || undefined, issues),
    googleMapsEmbedKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY || undefined,
    flags: {
      story3d: flag("flags.story3d", process.env.NEXT_PUBLIC_FLAG_STORY3D ?? "true", issues),
      boostSales: flag("flags.boostSales", process.env.NEXT_PUBLIC_FLAG_BOOST_SALES ?? "false", issues),
      ads: flag("flags.ads", process.env.NEXT_PUBLIC_FLAG_ADS ?? "false", issues),
      editorial: flag("flags.editorial", process.env.NEXT_PUBLIC_FLAG_EDITORIAL ?? "false", issues),
      providers: flag("flags.providers", process.env.NEXT_PUBLIC_FLAG_PROVIDERS ?? "true", issues),
      analytics: flag("flags.analytics", process.env.NEXT_PUBLIC_FLAG_ANALYTICS ?? "false", issues),
    },
  };
  if (issues.length) throw new Error("Invalid public environment: " + issues.join("; "));
  return env;
}

export const publicEnv: PublicEnv = readPublicEnv();

/**
 * Server-only API base URL (may differ from the browser URL, e.g. an internal
 * hostname). Falls back to the public one.
 */
export function serverApiUrl(): string {
  const value = process.env.WASSLA_API_URL || publicEnv.apiUrl;
  return value.replace(/\/+$/, "");
}

export function browserApiUrl(): string {
  return publicEnv.apiUrl.replace(/\/+$/, "");
}
