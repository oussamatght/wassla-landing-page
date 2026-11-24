"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CylinderGeometry, Group, InstancedMesh, Object3D } from "three";
import { chainPlate, chainRoller, petalDisc, sprocket } from "@/three/geometry";
import { setOpacity, useMaterials } from "@/three/materials";
import { MODELS, partExplode } from "@/three/models.manifest";
import { MOTO } from "@/three/timeline.config";
import { sample } from "@/three/math";
import { currentProgress, storyState } from "@/three/story-state";

const TEETH = 42;
const PITCH_R = 0.955;
const PITCH = (2 * Math.PI * PITCH_R) / TEETH;
const RUN = 3.2; // straight chain runs toward the (off-frame) front sprocket
const model = MODELS.moto;

/** Points every PITCH along: bottom run → wrap (270°→90° via 0°) → top run. */
function chainPins(): Array<{ x: number; y: number }> {
  const pins: Array<{ x: number; y: number }> = [];
  const arcLen = Math.PI * PITCH_R;
  const total = RUN + arcLen + RUN;
  for (let s = 0; s <= total; s += PITCH) {
    if (s < RUN) pins.push({ x: -RUN + s, y: -PITCH_R });
    else if (s < RUN + arcLen) {
      const a = -Math.PI / 2 + (s - RUN) / PITCH_R;
      pins.push({ x: Math.cos(a) * PITCH_R, y: Math.sin(a) * PITCH_R });
    } else pins.push({ x: -(s - RUN - arcLen), y: PITCH_R });
  }
  return pins;
}

export function MotoAssembly({ detail }: { detail: number }) {
  const m = useMaterials();
  const geo = useMemo(
    () => ({
      sprocket: sprocket(TEETH, 0.92, 1.0, detail),
      disc: petalDisc(detail),
      plate: chainPlate(PITCH, detail),
      roller: chainRoller(PITCH),
      carrier: new CylinderGeometry(0.42, 0.42, 0.08, Math.max(16, Math.round(48 * detail))).rotateX(Math.PI / 2),
    }),
    [detail],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const pins = useMemo(() => chainPins(), []);
  const linkCount = pins.length - 1;

  const root = useRef<Group>(null);
  const spinner = useRef<Group>(null);
  const disc = useRef<Group>(null);
  const plates = useRef<InstancedMesh>(null);
  const rollers = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    for (let i = 0; i < linkCount; i++) {
      const a = pins[i]!;
      const b = pins[i + 1]!;
      dummy.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, 0);
      dummy.rotation.set(0, 0, Math.atan2(b.y - a.y, b.x - a.x));
      dummy.updateMatrix();
      plates.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(a.x, a.y, 0);
      dummy.updateMatrix();
      rollers.current?.setMatrixAt(i, dummy.matrix);
    }
    if (plates.current) plates.current.instanceMatrix.needsUpdate = true;
    if (rollers.current) rollers.current.instanceMatrix.needsUpdate = true;
  }, [pins, linkCount]);

  const allMaterials = useMemo(() => [m.steel, m.steelDark, m.chain, m.anodised], [m]);
  const discOffset = partExplode(model, "disc");

  useFrame((_, delta) => {
    const p = currentProgress();
    const presence = sample(MOTO.presence, p);
    const g = root.current;
    if (!g) return;
    g.visible = presence > 0.01;
    if (!g.visible) return;
    setOpacity(allMaterials, presence);
    g.scale.setScalar(0.85 + 0.15 * presence);
    if (spinner.current && storyState.frozenAt === null) spinner.current.rotation.z += MOTO.idleSpin * delta;
    // The chain draws itself link by link around the sprocket.
    const visibleLinks = Math.round(linkCount * sample(MOTO.chain, p));
    if (plates.current) plates.current.count = visibleLinks;
    if (rollers.current) rollers.current.count = visibleLinks;
    const e = 1 - presence;
    disc.current?.position.set(discOffset[0], discOffset[1], -0.22 + discOffset[2] * e);
  });

  return (
    <group ref={root} name="moto" rotation={[0, 0.25, 0]}>
      <group ref={spinner} name="sprocket">
        <mesh geometry={geo.sprocket} material={m.steel} />
        <mesh geometry={geo.carrier} material={m.anodised} position={[0, 0, -0.08]} />
      </group>
      <group name="chain">
        <instancedMesh ref={plates} args={[geo.plate, m.chain, linkCount]} />
        <instancedMesh ref={rollers} args={[geo.roller, m.steelDark, linkCount]} />
      </group>
      <group ref={disc} name="disc">
        <mesh geometry={geo.disc} material={m.steel} />
      </group>
    </group>
  );
}
