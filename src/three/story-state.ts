/**
 * Mutable story state shared between the GSAP scroll driver (writer) and the
 * R3F scene (reader, inside useFrame). Deliberately NOT React state: no
 * re-render per frame.
 */
export interface StoryState {
  /** Scrubbed progress 0 → 1 over #histoire. */
  progress: number;
  /** Scroll velocity in px/s (ScrollTrigger.getVelocity()). */
  velocity: number;
  /** Fixed progress for static renders (fallback capture); null = live. */
  frozenAt: number | null;
  /** performance.now() when the current uninterrupted motion streak began; null = idle. */
  motionSince: number | null;
}

export const storyState: StoryState = {
  progress: 0,
  velocity: 0,
  frozenAt: null,
  motionSince: null,
};

export function currentProgress(): number {
  return storyState.frozenAt ?? storyState.progress;
}
