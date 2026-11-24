"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, InstancedMesh, Object3D, Vector3 } from "three";
import { labelElements } from "@/three/label-registry";
import { brakeFrictionFace, brakeHub, brakePad, brakeVane, caliperBody, wheelBolt } from "@/three/geometry";
import { setOpacity, useMaterials } from "@/three/materials";
import { MODELS, partExplode } from "@/three/models.manifest";
import { BRAKE, LABEL_VISIBILITY } from "@/three/timeline.config";
import { sample } from "@/three/math";
import { currentProgress, storyState } from "@/three/story-state";

const VANES = 36;
const BOLTS = 5;
const model = MODELS.brake;

export function BrakeAssembly({ detail, showLabels }: { detail: number; showLabels: boolean }) {
  const m = useMaterials();
  const geo = useMemo(
    () => ({
      face: brakeFrictionFace(detail),
      vane: brakeVane(),
      hub: brakeHub(detail),
      caliper: caliperBody(detail),
      pad: brakePad(detail),
      bolt: wheelBolt(),
    }),
    [detail],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const root = useRef<Group>(null);
  const disc = useRef<Group>(null);
  const hub = useRef<Group>(null);
  const caliper = useRef<Group>(null);
  const padIn = useRef<Group>(null);
  const padOut = useRef<Group>(null);
  const bolts = useRef<Group>(null);
  const vanes = useRef<InstancedMesh>(null);
  const boltMesh = useRef<InstancedMesh>(null);
  const projected = useRef(new Vector3());

  useLayoutEffect(() => {
    const dummy = new Object3D();
    if (vanes.current) {
      for (let i = 0; i < VANES; i++) {
        const a = (i / VANES) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * 0.74, Math.sin(a) * 0.74, 0);
        dummy.rotation.set(0, 0, a);
        dummy.updateMatrix();
        vanes.current.setMatrixAt(i, dummy.matrix);
      }
      vanes.current.instanceMatrix.needsUpdate = true;
    }
    if (boltMesh.current) {
      for (let i = 0; i < BOLTS; i++) {
        const a = (i / BOLTS) * Math.PI * 2 + Math.PI / 2;
        dummy.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3, -0.12);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        boltMesh.current.setMatrixAt(i, dummy.matrix);
      }
      boltMesh.current.instanceMatrix.needsUpdate = true;
    }
  }, [geo]);

  const allMaterials = useMemo(() => [m.steel, m.steelDark, m.castIron, m.caliper, m.friction], [m]);
  const parts = useMemo(
    () =>
      [
        [hub, partExplode(model, "hub")],
        [caliper, partExplode(model, "caliper")],
        [padIn, partExplode(model, "padInner")],
        [padOut, partExplode(model, "padOuter")],
        [bolts, partExplode(model, "bolts")],
      ] as const,
    [],
  );

  useFrame((state, delta) => {
    const p = currentProgress();
    const presence = sample(BRAKE.presence, p);
    const explode = sample(BRAKE.explode, p);
    const g = root.current;
    if (!g) return;
    g.visible = presence > 0.01;
    if (!g.visible) return;
    setOpacity(allMaterials, presence);
    g.scale.setScalar(0.82 + 0.18 * presence);
    const t = storyState.frozenAt === null ? state.clock.elapsedTime : 0;
    g.rotation.y = -0.35 + Math.sin(t * 0.25) * 0.12;
    if (disc.current && storyState.frozenAt === null) disc.current.rotation.z += BRAKE.idleSpin * delta;
    for (const [ref, v] of parts) ref.current?.position.set(v[0] * explode, v[1] * explode, v[2] * explode);

    if (showLabels) {
      // Project each anchor to screen space and move its DOM label.
      const lv = sample(LABEL_VISIBILITY, p);
      const { width, height } = state.size;
      g.updateMatrixWorld();
      model.labels.forEach((label, i) => {
        const el = labelElements[i];
        if (!el) return;
        const v = projected.current.set(label.anchor[0], label.anchor[1], label.anchor[2]).applyMatrix4(g.matrixWorld).project(state.camera);
        const x = ((v.x + 1) / 2) * width;
        const y = ((1 - v.y) / 2) * height;
        const inside = v.z < 1 && x > 8 && x < width - 8 && y > 72 && y < height - 8;
        const opacity = inside ? lv : 0;
        el.style.opacity = String(opacity);
        el.style.visibility = opacity > 0.02 ? "visible" : "hidden";
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-6px, -50%)`;
      });
    }
  });

  return (
    <group ref={root} name="brake">
      <group ref={disc} name="disc">
        <mesh geometry={geo.face} material={m.castIron} position={[0, 0, 0.05]} />
        <mesh geometry={geo.face} material={m.castIron} position={[0, 0, -0.05]} />
        <instancedMesh ref={vanes} args={[geo.vane, m.steelDark, VANES]} />
      </group>
      <group ref={hub} name="hub">
        <mesh geometry={geo.hub} material={m.steel} position={[0, 0, -0.02]} />
      </group>
      <group ref={caliper} name="caliper">
        <mesh geometry={geo.caliper} material={m.caliper} />
      </group>
      <group ref={padIn} name="padInner">
        <mesh geometry={geo.pad} material={m.friction} position={[0, 0, -0.11]} />
      </group>
      <group ref={padOut} name="padOuter">
        <mesh geometry={geo.pad} material={m.friction} position={[0, 0, 0.11]} />
      </group>
      <group ref={bolts} name="bolts">
        <instancedMesh ref={boltMesh} args={[geo.bolt, m.steel, BOLTS]} />
      </group>

    </group>
  );
}
