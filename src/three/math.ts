/** Small, allocation-free helpers used inside useFrame. */

export type Vec3 = readonly [number, number, number];

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smoothstep easing (ease-in-out), used between keyframes. */
export const smooth = (t: number) => t * t * (3 - 2 * t);

/** Keyframe track: [progress, value] pairs sorted by progress. */
export type Track = ReadonlyArray<readonly [number, number]>;

/** Piecewise-smoothstep interpolation of a track at progress p (0..1). */
export function sample(track: Track, p: number): number {
  const first = track[0];
  const last = track[track.length - 1];
  if (!first || !last) return 0;
  if (p <= first[0]) return first[1];
  if (p >= last[0]) return last[1];
  for (let i = 0; i < track.length - 1; i++) {
    const a = track[i]!;
    const b = track[i + 1]!;
    if (p >= a[0] && p <= b[0]) {
      const t = b[0] === a[0] ? 1 : (p - a[0]) / (b[0] - a[0]);
      return lerp(a[1], b[1], smooth(t));
    }
  }
  return last[1];
}

/** Camera keyframe interpolation into a reusable output array. */
export function sampleVec(
  keys: ReadonlyArray<{ at: number; value: Vec3 }>,
  p: number,
  out: [number, number, number],
): [number, number, number] {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (!first || !last) return out;
  if (p <= first.at) return copy(first.value, out);
  if (p >= last.at) return copy(last.value, out);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (p >= a.at && p <= b.at) {
      const t = smooth(b.at === a.at ? 1 : (p - a.at) / (b.at - a.at));
      out[0] = lerp(a.value[0], b.value[0], t);
      out[1] = lerp(a.value[1], b.value[1], t);
      out[2] = lerp(a.value[2], b.value[2], t);
      return out;
    }
  }
  return copy(last.value, out);
}

function copy(v: Vec3, out: [number, number, number]) {
  out[0] = v[0];
  out[1] = v[1];
  out[2] = v[2];
  return out;
}
