import { z } from "zod";
import { browserApiUrl, serverApiUrl } from "@/lib/env";

/**
 * Typed client for the WASSLA backend. Every response is validated with zod;
 * the backend envelope is `{ success: true, data }`; errors use a shared
 * error envelope.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly kind: "http" | "network" | "validation" | "timeout";

  constructor(
    message: string,
    options: { status?: number; code?: string; kind: ApiError["kind"]; cause?: unknown },
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code;
    this.kind = options.kind;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

const errorBodySchema = z
  .object({ message: z.string().optional(), code: z.string().optional() })
  .passthrough();

export type QueryValue = string | number | boolean | undefined | null;

export interface ApiRequestOptions {
  searchParams?: Record<string, QueryValue | QueryValue[]>;
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  signal?: AbortSignal;
  /** Next.js data cache (server components only). */
  revalidate?: number | false;
  tags?: string[];
  timeoutMs?: number;
}

export function buildUrl(
  base: string,
  path: string,
  searchParams?: ApiRequestOptions["searchParams"],
): string {
  const url = new URL(base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, ""));
  if (searchParams) {
    for (const [key, raw] of Object.entries(searchParams)) {
      const values = Array.isArray(raw) ? raw : [raw];
      for (const value of values) {
        if (value === undefined || value === null || value === "") continue;
        url.searchParams.append(key, String(value));
      }
    }
  }
  return url.toString();
}

const envelopeSchema = z.object({ success: z.literal(true), data: z.unknown() });

export async function apiRequest<T extends z.ZodTypeAny>(
  path: string,
  dataSchema: T,
  options: ApiRequestOptions = {},
): Promise<z.infer<T>> {
  const isServer = typeof window === "undefined";
  const url = buildUrl(isServer ? serverApiUrl() : browserApiUrl(), path, options.searchParams);

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), options.timeoutMs ?? 10_000);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout.signal]) : timeout.signal;

  const init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal,
  };
  if (isServer && (options.revalidate !== undefined || options.tags)) {
    init.next = { revalidate: options.revalidate, tags: options.tags };
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (cause) {
    clearTimeout(timer);
    if (options.signal?.aborted) throw cause;
    const timedOut = timeout.signal.aborted;
    throw new ApiError(timedOut ? "Request timed out" : "Network request failed", {
      kind: timedOut ? "timeout" : "network",
      cause,
    });
  }
  clearTimeout(timer);

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    const body = errorBodySchema.safeParse(json);
    throw new ApiError(body.success && body.data.message ? body.data.message : `HTTP ${response.status}`, {
      kind: "http",
      status: response.status,
      code: body.success ? body.data.code : undefined,
    });
  }

  const outer = envelopeSchema.safeParse(json);
  const inner = outer.success ? dataSchema.safeParse(outer.data.data) : null;
  if (!outer.success || !inner || !inner.success) {
    throw new ApiError("Unexpected response from the WASSLA API", {
      kind: "validation",
      status: response.status,
      cause: outer.success ? inner?.error : outer.error,
    });
  }
  return inner.data as z.infer<T>;
}
