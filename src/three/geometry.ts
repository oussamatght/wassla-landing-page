import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Path,
  Shape,
  Vector2,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Procedural, engineered-looking part geometry.
 * All sizes in scene units (disc radius ≈ 1). `detail` scales segment counts
 * for device tiers (1 = desktop, ~0.5 = mobile LOD).
 */

const seg = (n: number, detail: number) => Math.max(8, Math.round(n * detail));

/**
 * Hole outline as an explicit polygon (n points, clockwise). Built from
 * lineTo segments so its resolution does NOT follow the shape's
 * curveSegments (arcs are sampled at curveSegments × 2, which made tiny
 * drilled holes cost as much as the disc rim).
 */
function circlePath(cx: number, cy: number, r: number, n: number) {
  const p = new Path();
  for (let i = 0; i <= n; i++) {
    const a = -(i / n) * Math.PI * 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  }
  return p;
}

const holeRes = (base: number, detail: number) => Math.max(6, Math.round(base * detail));

function extrude(shape: Shape, depth: number, detail: number, bevel = 0.012, curveSegments = seg(48, detail)) {
  const g = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: detail >= 1 ? 2 : 1,
    curveSegments,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

/* ── Automobile brake ─────────────────────────────────────── */

/** One friction face of a ventilated, cross-drilled disc (annulus r 0.48–1). */
export function brakeFrictionFace(detail: number) {
  const s = new Shape();
  s.absarc(0, 0, 1, 0, Math.PI * 2, false);
  s.holes.push(circlePath(0, 0, 0.48, holeRes(64, detail)));
  // Cross-drilled pattern: 3 staggered rings of holes.
  const rings = [0.62, 0.74, 0.86];
  const perRing = detail >= 1 ? 18 : 12;
  rings.forEach((r, ri) => {
    for (let i = 0; i < perRing; i++) {
      const a = (i / perRing) * Math.PI * 2 + ri * (Math.PI / perRing) * 0.66;
      s.holes.push(circlePath(Math.cos(a) * r, Math.sin(a) * r, 0.022, holeRes(8, detail)));
    }
  });
  return extrude(s, 0.03, detail, 0.006, seg(48, detail));
}

/** Radial cooling vane between the two friction faces. */
export function brakeVane() {
  return new BoxGeometry(0.46, 0.022, 0.07);
}

/** Disc "hat" + wheel hub flange, lathed from a machined profile. */
export function brakeHub(detail: number) {
  const profile = [
    [0.0, -0.24],
    [0.2, -0.24],
    [0.22, -0.22],
    [0.42, -0.22],
    [0.44, -0.2],
    [0.48, -0.06],
    [0.48, 0.02],
    [0.44, 0.03],
    [0.3, 0.03],
    [0.28, 0.06],
    [0.16, 0.06],
    [0.15, 0.03],
    [0.0, 0.03],
  ].map(([x, y]) => new Vector2(x!, y!));
  const g = new LatheGeometry(profile, seg(72, detail));
  g.rotateX(Math.PI / 2); // lathe axis Y → disc axis Z
  return g;
}

/** Caliper body: a bevelled arc band straddling the disc edge (top-right). */
export function caliperBody(detail: number) {
  const a0 = (40 * Math.PI) / 180;
  const a1 = (118 * Math.PI) / 180;
  const rIn = 0.74;
  const rOut = 1.13;
  const s = new Shape();
  s.absarc(0, 0, rOut, a0, a1, false);
  s.absarc(Math.cos(a1) * ((rIn + rOut) / 2), Math.sin(a1) * ((rIn + rOut) / 2), (rOut - rIn) / 2, a1, a1 + Math.PI, false);
  s.absarc(0, 0, rIn, a1, a0, true);
  s.absarc(Math.cos(a0) * ((rIn + rOut) / 2), Math.sin(a0) * ((rIn + rOut) / 2), (rOut - rIn) / 2, a0 + Math.PI, a0 + Math.PI * 2, false);
  // Inspection window.
  const am = (a0 + a1) / 2;
  s.holes.push(circlePath(Math.cos(am) * 0.94, Math.sin(am) * 0.94, 0.07, holeRes(20, detail)));
  return extrude(s, 0.34, detail, 0.035, seg(32, detail));
}

/** Brake pad (backing plate + friction block) as an annular sector. */
export function brakePad(detail: number) {
  const a0 = (52 * Math.PI) / 180;
  const a1 = (106 * Math.PI) / 180;
  const s = new Shape();
  s.absarc(0, 0, 1.0, a0, a1, false);
  s.absarc(0, 0, 0.79, a1, a0, true);
  s.closePath();
  return extrude(s, 0.05, detail, 0.008, seg(24, detail));
}

/** Wheel bolt: shaft + hex head, merged into one geometry. */
export function wheelBolt() {
  const shaft = new CylinderGeometry(0.026, 0.026, 0.3, 12);
  shaft.translate(0, 0.15, 0);
  const head = new CylinderGeometry(0.05, 0.05, 0.06, 6);
  head.translate(0, 0.33, 0);
  const merged = mergeGeometries([shaft, head])!;
  merged.rotateX(Math.PI / 2); // along +Z
  shaft.dispose();
  head.dispose();
  return merged;
}

/* ── Motorcycle ───────────────────────────────────────────── */

/** Rear sprocket with real tooth profile and lightening holes. */
export function sprocket(teeth: number, rootR: number, tipR: number, detail: number) {
  const s = new Shape();
  const steps = teeth * Math.max(5, Math.round(8 * detail));
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const phase = (a * teeth) / (Math.PI * 2);
    const f = phase - Math.floor(phase); // 0..1 within one tooth
    // Flat-topped tooth with rounded flanks.
    const tooth = f < 0.15 || f > 0.85 ? 0 : Math.min(1, Math.sin(((f - 0.15) / 0.7) * Math.PI) * 1.6);
    const r = rootR + (tipR - rootR) * tooth;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.holes.push(circlePath(0, 0, rootR * 0.24, holeRes(40, detail)));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    s.holes.push(circlePath(Math.cos(a) * rootR * 0.58, Math.sin(a) * rootR * 0.58, rootR * 0.16, holeRes(28, detail)));
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    s.holes.push(circlePath(Math.cos(a) * rootR * 0.34, Math.sin(a) * rootR * 0.34, 0.03, holeRes(10, detail)));
  }
  return extrude(s, 0.06, detail, 0.008, 4);
}

/** Wave ("petal") brake disc for motorcycles. */
export function petalDisc(detail: number) {
  const s = new Shape();
  const steps = seg(240, detail);
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = 0.82 + 0.035 * Math.sin(a * 14);
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.holes.push(circlePath(0, 0, 0.5, holeRes(56, detail)));
  const perRing = detail >= 1 ? 16 : 10;
  for (let i = 0; i < perRing; i++) {
    const a = (i / perRing) * Math.PI * 2;
    s.holes.push(circlePath(Math.cos(a) * 0.66, Math.sin(a) * 0.66, 0.028, holeRes(8, detail)));
  }
  return extrude(s, 0.025, detail, 0.004, 4);
}

/** One chain link: two side plates (figure-8 outline) merged. */
export function chainPlate(pitch: number, detail: number) {
  const r = pitch * 0.36;
  const s = new Shape();
  s.absarc(-pitch / 2, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
  s.absarc(pitch / 2, 0, r, -Math.PI / 2, Math.PI / 2, false);
  s.closePath();
  s.holes.push(circlePath(-pitch / 2, 0, r * 0.38, 6));
  s.holes.push(circlePath(pitch / 2, 0, r * 0.38, 6));
  const plateA = extrude(s, 0.012, detail, 0, detail >= 1 ? 4 : 3);
  const plateB = plateA.clone();
  plateA.translate(0, 0, 0.045);
  plateB.translate(0, 0, -0.045);
  const merged = mergeGeometries([plateA, plateB])!;
  plateA.dispose();
  plateB.dispose();
  return merged;
}

export function chainRoller(pitch: number) {
  const g = new CylinderGeometry(pitch * 0.2, pitch * 0.2, 0.08, 8, 1, true);
  g.rotateX(Math.PI / 2);
  return g;
}

/* ── Heavy-vehicle turbocharger ───────────────────────────── */

/** One compressor blade: a thin plate twisted along its height. */
export function compressorBlade(detail: number) {
  const g = new BoxGeometry(0.018, 0.42, 0.36, 1, seg(10, detail), seg(8, detail));
  const pos = g.attributes.position!;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // blade height (radial)
    const z = pos.getZ(i); // along the shaft
    const t = (y + 0.21) / 0.42; // 0 hub → 1 tip
    const twist = (0.15 + 0.75 * t) * (z + 0.18) * 2.4; // stronger at inlet
    const cos = Math.cos(twist);
    const sin = Math.sin(twist);
    pos.setXYZ(i, x * cos - z * sin * 0.35, y, z * cos + x * sin);
  }
  g.computeVertexNormals();
  g.translate(0, 0.33, 0); // radial offset from the hub axis
  return g;
}

/** Compressor hub with nose cone, lathed. */
export function compressorHub(detail: number) {
  const profile = [
    [0.0, -0.3],
    [0.13, -0.3],
    [0.13, -0.18],
    [0.11, 0.0],
    [0.07, 0.14],
    [0.03, 0.2],
    [0.0, 0.21],
  ].map(([x, y]) => new Vector2(x!, y!));
  const g = new LatheGeometry(profile, seg(40, detail));
  g.rotateX(Math.PI / 2);
  return g;
}

/** Half of a volute housing (bell + scroll), split on the vertical plane. */
export function housingHalf(side: "left" | "right", detail: number) {
  const profile = [
    [0.36, 0.4],
    [0.42, 0.36],
    [0.5, 0.16],
    [0.78, 0.02],
    [0.9, -0.14],
    [0.86, -0.3],
    [0.62, -0.36],
    [0.3, -0.38],
    [0.28, -0.3],
    [0.56, -0.26],
    [0.72, -0.16],
    [0.62, -0.02],
    [0.42, 0.1],
    [0.34, 0.3],
  ].map(([x, y]) => new Vector2(x!, y!));
  // Lathe: x = r·sin(φ), z = r·cos(φ). φ ∈ [0, π] ⇒ x ≥ 0 (right half);
  // φ ∈ [π, 2π] ⇒ x ≤ 0 (left half). rotateX keeps x, so the split plane is YZ.
  const start = side === "right" ? 0 : Math.PI;
  const g = new LatheGeometry(profile, seg(48, detail), start, Math.PI);
  g.rotateX(Math.PI / 2);
  return g;
}

/** Centre bearing housing with cooling fins (merged). */
export function centerHousing(detail: number) {
  const parts: BufferGeometry[] = [];
  const core = new CylinderGeometry(0.26, 0.26, 0.5, seg(40, detail));
  core.rotateX(Math.PI / 2);
  parts.push(core);
  for (let i = 0; i < 5; i++) {
    const fin = new CylinderGeometry(0.34, 0.34, 0.025, seg(40, detail));
    fin.rotateX(Math.PI / 2);
    fin.translate(0, 0, -0.18 + i * 0.09);
    parts.push(fin);
  }
  const merged = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

/** Turbine-side housing: heavier cast scroll. */
export function turbineHousing(detail: number) {
  const profile = [
    [0.24, 0.34],
    [0.5, 0.3],
    [0.86, 0.12],
    [0.98, -0.08],
    [0.88, -0.28],
    [0.5, -0.34],
    [0.24, -0.3],
  ].map(([x, y]) => new Vector2(x!, y!));
  const g = new LatheGeometry(profile, seg(56, detail));
  g.rotateX(Math.PI / 2);
  return g;
}
