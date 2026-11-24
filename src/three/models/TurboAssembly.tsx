"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, InstancedMesh, Object3D } from "three";
import { centerHousing, compressorBlade, compressorHub, housingHalf, turbineHousing } from "@/three/geometry";
import { setOpacity, useMaterials } from "@/three/materials";
import { MODELS, partExplode } from "@/three/models.manifest";
import { HEAVY } from "@/three/timeline.config";
import { sample } from "@/three/math";
import { currentProgress, storyState } from "@/three/story-state";

const BLADES = 12;
const model = MODELS.turbo;

export function TurboAssembly({ detail }: { detail: number }) {
  const m = useMaterials();
  const geo = useMemo(
    () => ({
      blade: compressorBlade(detail),
      hub: compressorHub(detail),
      left: housingHalf("left", detail),
      right: housingHalf("right", detail),
      center: centerHousing(detail),
      turbine: turbineHousing(detail),
    }),
    [detail],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const root = useRef<Group>(null);
  const wheel = useRef<Group>(null);
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const center = useRef<Group>(null);
  const turbine = useRef<Group>(null);
  const blades = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    for (let i = 0; i < BLADES; i++) {
      dummy.rotation.set(0, 0, (i / BLADES) * Math.PI * 2);
      dummy.updateMatrix();
      blades.current?.setMatrixAt(i, dummy.matrix);
    }
    if (blades.current) blades.current.instanceMatrix.needsUpdate = true;
  }, [geo]);

  const allMaterials = useMemo(() => [m.anodised, m.castIron, m.steel, m.steelDark], [m]);
  const vLeft = partExplode(model, "compressorHousingLeft");
  const vRight = partExplode(model, "compressorHousingRight");
  const vCenter = partExplode(model, "centerHousing");
  const vTurbine = partExplode(model, "turbineHousing");

  useFrame((_, delta) => {
    const p = currentProgress();
    const presence = sample(HEAVY.presence, p);
    const g = root.current;
    if (!g) return;
    g.visible = presence > 0.01;
    if (!g.visible) return;
    setOpacity(allMaterials, presence);
    g.scale.setScalar(0.88 + 0.12 * presence);
    const split = sample(HEAVY.split, p);
    left.current?.position.set(vLeft[0] * split, vLeft[1] * split, vLeft[2] * split);
    right.current?.position.set(vRight[0] * split, vRight[1] * split, vRight[2] * split);
    center.current?.position.set(vCenter[0] * 0.2, 0, -0.5 + vCenter[2] * split * 0.3);
    turbine.current?.position.set(0, 0, -1.0 + vTurbine[2] * split * 0.25);
    if (wheel.current && storyState.frozenAt === null) {
      // Compressor wheel spins faster with scroll velocity.
      const spin = HEAVY.wheelBaseSpin + Math.min(18, Math.abs(storyState.velocity) * HEAVY.wheelVelocityGain);
      wheel.current.rotation.z += spin * delta;
    }
  });

  return (
    <group ref={root} name="turbo" rotation={[0.18, -0.55, 0]}>
      <group ref={wheel} name="compressorWheel" position={[0, 0, 0.06]}>
        <mesh geometry={geo.hub} material={m.steel} />
        <instancedMesh ref={blades} args={[geo.blade, m.anodised, BLADES]} />
      </group>
      <group ref={left} name="compressorHousingLeft">
        <mesh geometry={geo.left} material={m.anodised} />
      </group>
      <group ref={right} name="compressorHousingRight">
        <mesh geometry={geo.right} material={m.anodised} />
      </group>
      <group ref={center} name="centerHousing" position={[0, 0, -0.5]}>
        <mesh geometry={geo.center} material={m.steelDark} />
      </group>
      <group ref={turbine} name="turbineHousing" position={[0, 0, -1]}>
        <mesh geometry={geo.turbine} material={m.castIron} />
      </group>
    </group>
  );
}
