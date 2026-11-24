/**
 * Device tier heuristic. `detect-gpu` was not used: it
 * downloads GPU benchmark tables from a third-party CDN at runtime.
 *
 *  high  full scene, labels, contact shadows, DPR ≤ 2
 *  mid   no shadows, DPR ≤ 1.5
 *  low   mobile LOD (≈ half the segments), DPR ≤ 1.25, fewer labels
 *  none  no WebGL / software renderer → static chapter images
 */
export type DeviceTier = "high" | "mid" | "low" | "none";

export interface TierSettings {
  dpr: [number, number];
  detail: number;
  shadows: boolean;
  labels: boolean;
  antialias: boolean;
}

export const TIER_SETTINGS: Record<Exclude<DeviceTier, "none">, TierSettings> = {
  high: { dpr: [1, 2], detail: 1, shadows: true, labels: true, antialias: true },
  mid: { dpr: [1, 1.5], detail: 0.8, shadows: false, labels: true, antialias: true },
  low: { dpr: [1, 1.25], detail: 0.5, shadows: false, labels: false, antialias: false },
};

export function downgrade(tier: DeviceTier): DeviceTier {
  return tier === "high" ? "mid" : tier === "mid" ? "low" : "none";
}

export function detectTier(): DeviceTier {
  if (typeof window === "undefined") return "none";
  let renderer = "";
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "none";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return "none";
  }
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return "none";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

  if (saveData) return "low";
  if (coarse || small) return cores >= 8 && (memory === undefined || memory >= 6) && !small ? "mid" : "low";
  if (cores >= 8 && (memory === undefined || memory >= 8)) return "high";
  return "mid";
}
