"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { PerspectiveCamera } from "three";
import { CAMERA_FOV, CAMERA_POSITION, CAMERA_TARGET, CANVAS_OPACITY } from "@/three/timeline.config";
import { sample, sampleVec } from "@/three/math";
import { currentProgress } from "@/three/story-state";
import type { TierSettings } from "@/three/device-tier";
import { BrakeAssembly } from "@/three/models/BrakeAssembly";
import { MotoAssembly } from "@/three/models/MotoAssembly";
import { TurboAssembly } from "@/three/models/TurboAssembly";

type Triple = [number, number, number];

/** Camera rig: all keyframes come from timeline.config.ts. */
function CameraRig() {
  const scratch = useRef<{ pos: Triple; target: Triple; wrapper: HTMLElement | null }>({
    pos: [0, 0, 0],
    target: [0, 0, 0],
    wrapper: null,
  });
  useFrame((state) => {
    const p = currentProgress();
    const s = scratch.current;
    sampleVec(CAMERA_POSITION, p, s.pos);
    sampleVec(CAMERA_TARGET, p, s.target);
    if (state.size.width / state.size.height < 0.9) {
      // Phones: object centred, lower in frame and further away, so the
      // overlay text keeps the top of the screen.
      s.target[0] *= 0.15;
      s.target[1] += 0.55;
      s.pos[2] *= 1.45;
      s.pos[0] *= 0.6;
    }
    const camera = state.camera as PerspectiveCamera;
    camera.position.set(s.pos[0], s.pos[1], s.pos[2]);
    camera.lookAt(s.target[0], s.target[1], s.target[2]);
    const fov = sample(CAMERA_FOV, p);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    s.wrapper ??= state.gl.domElement.closest<HTMLElement>("[data-story-canvas]");
    if (s.wrapper) s.wrapper.style.opacity = String(sample(CANVAS_OPACITY, p));
  });
  return null;
}

declare global {
  interface Window {
    __storyStats?: { calls: number; triangles: number; geometries: number; textures: number };
  }
}

/** Dev-only renderer stats for budget checks (docs/3D_PIPELINE.md). */
function DevStats() {
  useFrame(({ gl }) => {
    if (process.env.NODE_ENV === "production") return;
    window.__storyStats = {
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
    };
  });
  return null;
}

/**
 * Studio: lightformer environment (no HDRI download), cyan rim (left/back),
 * violet rim (right/back), soft white key. ACES tone mapping set on the
 * renderer by StoryCanvas.
 */
export function StoryScene({ settings }: { settings: TierSettings }) {
  return (
    <>
      <CameraRig />
      <DevStats />
      <group>
        <hemisphereLight args={["#cfd8ff", "#05081f", 0.35]} />
        <directionalLight position={[3, 4, 5]} intensity={2.4} color="#f4f6ff" />
        <directionalLight position={[-2, 1, 4]} intensity={0.6} color="#dfe6ff" />
        <pointLight position={[-4, 1.5, -2.5]} intensity={16} distance={12} color="#30eefd" />
        <pointLight position={[4, 1.2, -2.5]} intensity={11} distance={12} color="#7d4dff" />
      </group>

      <Environment resolution={settings.detail >= 1 ? 256 : 64} frames={1}>
        <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[0, 4, 3]} scale={[7, 1.6, 1]} rotation-x={Math.PI / 2.4} />
        <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[3, 1, 4]} scale={[3, 3, 1]} />
        <Lightformer form="rect" intensity={3} color="#30eefd" position={[-5, 0.5, -1]} scale={[1, 5, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={3} color="#7135fa" position={[5, 0.5, -1]} scale={[1, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={0.8} color="#145dff" position={[0, -2, -4]} scale={3} />
      </Environment>

      <group position={[0, 0, 0]}>
        <BrakeAssembly detail={settings.detail} showLabels={settings.labels} />
        <MotoAssembly detail={settings.detail} />
        <TurboAssembly detail={settings.detail} />
      </group>

      {settings.shadows && (
        <ContactShadows position={[0, -1.35, 0]} opacity={0.55} scale={7} blur={2.6} far={2.5} resolution={512} color="#000214" frames={Infinity} />
      )}
    </>
  );
}
