import type { Vec3 } from "@/three/math";

/**
 * Model manifest. Every 3D asset goes through here.
 * Swapping a procedural assembly for an optimised GLB later = set `source`
 * to { kind: "glb", url } and keep the same part names / explode vectors.
 */

export type ModelSource =
  | { kind: "procedural"; component: "BrakeAssembly" | "MotoAssembly" | "TurboAssembly" }
  | { kind: "glb"; url: string; draco?: boolean };

export interface PartSpec {
  /** Mesh/group name; GLBs must use the same names. */
  name: string;
  /** Offset applied at full explode (scene units). */
  explode: Vec3;
}

export interface LabelSpec {
  text: string;
  /** Anchor in the assembly's local space at full explode. */
  anchor: Vec3;
}

export interface ModelEntry {
  id: "brake" | "moto" | "turbo";
  title: string;
  source: ModelSource;
  parts: PartSpec[];
  labels: LabelSpec[];
  scale: number;
  /** Desktop and mobile triangle budgets for this asset. */
  triangleBudget: { desktop: number; mobile: number };
  licence: string;
}

export const MODELS: Record<ModelEntry["id"], ModelEntry> = {
  brake: {
    id: "brake",
    title: "Ensemble de freinage automobile",
    source: { kind: "procedural", component: "BrakeAssembly" },
    parts: [
      { name: "disc", explode: [0, 0, 0] },
      { name: "hub", explode: [0, 0, -0.7] },
      { name: "caliper", explode: [0.35, 0.45, 0.3] },
      { name: "padInner", explode: [0.12, 0.2, -0.38] },
      { name: "padOuter", explode: [0.12, 0.2, 0.5] },
      { name: "bolts", explode: [0, 0, 0.85] },
    ],
    labels: [
      { text: "Disque ventilé", anchor: [-0.9, -0.62, 0.1] },
      { text: "Étrier", anchor: [0.75, 1.42, 0.35] },
      { text: "Plaquettes", anchor: [0.05, 1.05, 0.62] },
      { text: "Moyeu", anchor: [0.05, -0.45, -0.75] },
    ],
    scale: 1,
    triangleBudget: { desktop: 120_000, mobile: 35_000 },
    licence: "Procedural geometry written for WASSLA (no third-party asset).",
  },
  moto: {
    id: "moto",
    title: "Transmission et freinage moto",
    source: { kind: "procedural", component: "MotoAssembly" },
    parts: [
      { name: "sprocket", explode: [0, 0, 0] },
      { name: "chain", explode: [0, 0, 0.05] },
      { name: "disc", explode: [0, 0, -0.35] },
    ],
    labels: [],
    scale: 1,
    triangleBudget: { desktop: 110_000, mobile: 30_000 },
    licence: "Procedural geometry written for WASSLA (no third-party asset).",
  },
  turbo: {
    id: "turbo",
    title: "Turbocompresseur poids lourd",
    source: { kind: "procedural", component: "TurboAssembly" },
    parts: [
      { name: "compressorWheel", explode: [0, 0, 0] },
      { name: "compressorHousingLeft", explode: [-0.85, 0, 0] },
      { name: "compressorHousingRight", explode: [0.85, 0, 0] },
      { name: "centerHousing", explode: [0, 0, -0.6] },
      { name: "turbineHousing", explode: [0, 0, -1.2] },
    ],
    labels: [],
    scale: 1,
    triangleBudget: { desktop: 70_000, mobile: 20_000 },
    licence: "Procedural geometry written for WASSLA (no third-party asset).",
  },
};

export function partExplode(model: ModelEntry, name: string): Vec3 {
  return model.parts.find((p) => p.name === name)?.explode ?? [0, 0, 0];
}
