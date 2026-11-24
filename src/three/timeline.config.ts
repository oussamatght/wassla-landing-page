import type { Track, Vec3 } from "@/three/math";

/**
 * THE single place to tune the scroll story.
 * Progress 0 → 1 spans the story section (#histoire, ≈ 500vh). Components
 * read these values; they never hard-code timings or camera positions.
 */

export type ChapterId = "hero" | "automobile" | "moto" | "heavy" | "marketplace";

export interface ChapterConfig {
  id: ChapterId;
  start: number;
  end: number;
  /** Panel height in viewport units; the sum is the story height. */
  panelVh: number;
  /** Static key frame used by fallbacks (no WebGL / reduced motion). */
  keyFrame: number;
  fallbackImage: string;
}

export const CHAPTERS: readonly ChapterConfig[] = [
  { id: "hero", start: 0, end: 0.1, panelVh: 100, keyFrame: 0.02, fallbackImage: "/fallbacks/chapter-0-hero.webp" },
  { id: "automobile", start: 0.1, end: 0.35, panelVh: 125, keyFrame: 0.26, fallbackImage: "/fallbacks/chapter-1-automobile.webp" },
  { id: "moto", start: 0.35, end: 0.6, panelVh: 125, keyFrame: 0.5, fallbackImage: "/fallbacks/chapter-2-moto.webp" },
  { id: "heavy", start: 0.6, end: 0.85, panelVh: 100, keyFrame: 0.74, fallbackImage: "/fallbacks/chapter-3-heavy.webp" },
  { id: "marketplace", start: 0.85, end: 1, panelVh: 50, keyFrame: 0.95, fallbackImage: "/fallbacks/chapter-4-marketplace.webp" },
] as const;

export const STORY_HEIGHT_VH = CHAPTERS.reduce((sum, c) => sum + c.panelVh, 0);

/** GSAP ScrollTrigger scrub smoothing (seconds). */
export const SCRUB = 0.8;

/** Camera: position + look-at target, interpolated with smoothstep. */
export const CAMERA_POSITION: ReadonlyArray<{ at: number; value: Vec3 }> = [
  { at: 0.0, value: [3.0, 0.6, 5.7] }, // 3/4 front, slight low angle
  { at: 0.1, value: [3.1, 0.8, 5.4] },
  { at: 0.2, value: [2.6, 0.85, 5.4] },
  { at: 0.3, value: [2.0, 0.8, 5.9] }, // dolly + orbit ≈ 60°, whole explode in frame
  { at: 0.36, value: [0.9, 0.5, 5.0] },
  { at: 0.5, value: [0.2, 0.3, 4.9] }, // side profile, tighter
  { at: 0.6, value: [0.8, 0.45, 5.2] },
  { at: 0.75, value: [2.3, 1.0, 5.9] }, // wide, heavy, slow push-in
  { at: 0.85, value: [1.7, 0.75, 5.1] },
  { at: 1.0, value: [1.0, 1.6, 9.5] }, // pull back
];

export const CAMERA_TARGET: ReadonlyArray<{ at: number; value: Vec3 }> = [
  { at: 0.0, value: [-1.3, 0.05, 0] }, // object sits right of the hero text
  { at: 0.1, value: [-1.05, 0.05, 0] },
  { at: 0.2, value: [-0.7, 0.3, 0] },
  { at: 0.3, value: [-0.75, 0.35, 0] }, // explode framed right of the text
  { at: 0.5, value: [-0.95, 0.05, 0] },
  { at: 0.75, value: [-0.85, 0, 0] },
  { at: 1.0, value: [0, 0, 0] },
];

export const CAMERA_FOV: Track = [
  [0, 32],
  [0.3, 30],
  [0.5, 34],
  [0.75, 36],
  [1, 40],
];

/** Per-assembly presence (0 hidden → 1 fully formed) and part motion. */
export const BRAKE = {
  presence: [[0, 1], [0.35, 1], [0.42, 0]] as Track,
  explode: [[0, 0], [0.12, 0], [0.28, 1], [0.34, 1], [0.4, 0.15]] as Track,
  /** Idle spin in radians per second while visible. */
  idleSpin: 0.12,
};

export const MOTO = {
  presence: [[0.36, 0], [0.44, 1], [0.6, 1], [0.66, 0]] as Track,
  /** Chain "draws" itself around the sprocket. */
  chain: [[0.4, 0], [0.5, 1]] as Track,
  idleSpin: 0.18,
};

export const HEAVY = {
  presence: [[0.6, 0], [0.67, 1], [0.86, 1], [0.95, 0]] as Track,
  /** Housing halves split apart. */
  split: [[0.66, 0], [0.76, 1], [0.84, 1], [0.9, 0.2]] as Track,
  /** Compressor wheel spin: base rad/s plus scroll-velocity gain. */
  wheelBaseSpin: 1.2,
  wheelVelocityGain: 0.012,
};

/** Whole canvas fades to the page background at the end. */
export const CANVAS_OPACITY: Track = [
  [0, 1],
  [0.88, 1],
  [0.98, 0],
];

/** Technical labels (chapter 1 only, ≤ 4 visible). */
export const LABEL_VISIBILITY: Track = [
  [0.16, 0],
  [0.22, 1],
  [0.33, 1],
  [0.37, 0],
];
