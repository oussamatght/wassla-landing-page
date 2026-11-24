"use client";

import { browserApiUrl } from "@/lib/env";

/**
 * Prestataire web session. Uses the EXISTING WASSLA auth (POST /auth/login →
 * OTP email → POST /auth/verify-otp) — no separate login system. Tokens live
 * in sessionStorage (this tab only, cleared when it closes). Authorization is
 * enforced by the backend (requireRole("prestataire")).
 */
const KEY = "wassla.prestataire.session";

export interface PrestataireSession {
  accessToken: string;
  refreshToken?: string;
  user: { _id: string; firstName?: string; lastName?: string; role: string; email?: string };
}

// Cached by the raw stored string: useSyncExternalStore requires getSnapshot to
// return the SAME object while the store is unchanged (JSON.parse returns a new
// object on every call, which React treats as a change → infinite re-render loop).
let cachedRaw: string | null = null;
let cachedSession: PrestataireSession | null = null;

export function readSession(): PrestataireSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedSession;
    cachedRaw = raw;
    cachedSession = raw ? (JSON.parse(raw) as PrestataireSession) : null;
    return cachedSession;
  } catch {
    return null;
  }
}

export function saveSession(s: PrestataireSession) {
  try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ }
}

export function clearSession() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

export class AuthError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

async function parse<T>(res: Response): Promise<T> {
  let json: { success?: boolean; data?: T; message?: string; code?: string } | null = null;
  try { json = await res.json(); } catch { json = null; }
  if (!res.ok) throw new AuthError(json?.message || `Erreur ${res.status}`, res.status, json?.code);
  return (json?.data ?? json) as T;
}

const headers = (extra?: Record<string, string>) => ({ Accept: "application/json", "X-Api-Contract": "2", ...extra });

export async function login(identifier: string, password: string) {
  const isEmail = identifier.includes("@");
  const body = isEmail ? { email: identifier.trim().toLowerCase(), password } : { phone: identifier.replace(/\s/g, ""), password };
  const res = await fetch(`${browserApiUrl()}/auth/login`, { method: "POST", headers: headers({ "Content-Type": "application/json" }), body: JSON.stringify(body) });
  return parse<{ otpSent?: boolean; accessToken?: string; refreshToken?: string; user?: PrestataireSession["user"] }>(res);
}

export async function verifyOtp(identifier: string, otpCode: string) {
  const isEmail = identifier.includes("@");
  const body = { ...(isEmail ? { email: identifier.trim().toLowerCase() } : { phone: identifier.replace(/\s/g, "") }), otpCode, purpose: "auth" };
  const res = await fetch(`${browserApiUrl()}/auth/verify-otp`, { method: "POST", headers: headers({ "Content-Type": "application/json" }), body: JSON.stringify(body) });
  return parse<{ accessToken: string; refreshToken: string; user: PrestataireSession["user"] }>(res);
}

/** Authenticated call; a 401 clears the session so the UI returns to login. */
export async function authFetch<T>(path: string, init: { method?: string; json?: unknown; form?: FormData } = {}): Promise<T> {
  const session = readSession();
  if (!session) throw new AuthError("Session expirée. Reconnectez-vous.", 401);
  const res = await fetch(`${browserApiUrl()}${path}`, {
    method: init.method ?? "GET",
    headers: headers({ Authorization: `Bearer ${session.accessToken}`, ...(init.json !== undefined ? { "Content-Type": "application/json" } : {}) }),
    body: init.form ?? (init.json !== undefined ? JSON.stringify(init.json) : undefined),
  });
  if (res.status === 401) clearSession();
  return parse<T>(res);
}
