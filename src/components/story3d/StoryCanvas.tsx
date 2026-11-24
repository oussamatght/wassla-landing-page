"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { StoryScene } from "@/three/StoryScene";
import { TIER_SETTINGS, type DeviceTier } from "@/three/device-tier";
import { MODELS } from "@/three/models.manifest";
import { labelElements } from "@/three/label-registry";
import { currentProgress, storyState } from "@/three/story-state";

/** Idle frame rate per tier: the scene only needs full rate while the scroll moves it. */
const IDLE_FPS: Record<Exclude<DeviceTier, "none">, number> = { high: 30, mid: 24, low: 15 };
/** PerformanceMonitor window (10 × 250 ms): declines only count after this much continuous motion. */
const MONITOR_WINDOW_MS = 2500;

/**
 * Demand-mode frame driver: renders every animation frame while the scrubbed
 * progress changes, and at a capped idle rate otherwise (idle sway / spin keep
 * running, at a fraction of the CPU and battery cost). Rotation speeds use
 * frame delta, so they are unchanged.
 */
function FrameDriver({ idleFps }: { idleFps: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let lastProgress = Number.NaN;
    let lastIdleFrame = 0;
    let lastMotion = 0;
    const tick = (now: number) => {
      const p = currentProgress();
      if (p !== lastProgress) {
        lastProgress = p;
        lastMotion = now;
        storyState.motionSince ??= now;
        invalidate();
      } else {
        if (now - lastMotion > 300) storyState.motionSince = null;
        if (now - lastIdleFrame >= 1000 / idleFps) {
          lastIdleFrame = now;
          invalidate();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      storyState.motionSince = null;
    };
  }, [invalidate, idleFps]);
  return null;
}

interface StoryCanvasProps {
  tier: Exclude<DeviceTier, "none">;
  /** false = stop rendering (story off-screen or tab hidden). */
  active: boolean;
  onDowngrade: () => void;
  onContextLost: () => void;
}

/**
 * The single persistent WebGL canvas. Loaded with next/dynamic({ ssr:false })
 * by StoryStage after first paint; aria-hidden because every chapter's
 * information is in the HTML panels.
 */
export default function StoryCanvas({ tier, active, onDowngrade, onContextLost }: StoryCanvasProps) {
  const settings = TIER_SETTINGS[tier];

  return (
    <div data-story-canvas className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={settings.dpr}
        frameloop={active ? "demand" : "never"}
        camera={{ position: [3.0, 0.6, 5.7], fov: 32, near: 0.1, far: 60 }}
        gl={{ antialias: settings.antialias, alpha: true, powerPreference: "high-performance", stencil: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = SRGBColorSpace;
          gl.setClearColor(0x000000, 0);
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onContextLost();
          });
        }}
        style={{ pointerEvents: "none" }}>
        {active && <FrameDriver idleFps={IDLE_FPS[tier]} />}
        {/* Drop a tier if FPS stays below ~45 (2 consecutive declines) — only measured during
            continuous motion, since idle frames are deliberately capped. */}
        <PerformanceMonitor
          bounds={() => [45, 120]}
          flipflops={2}
          onDecline={() => {
            const since = storyState.motionSince;
            if (since !== null && performance.now() - since >= MONITOR_WINDOW_MS) onDowngrade();
          }}
        />
        <StoryScene settings={settings} />
      </Canvas>
      {settings.labels && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {MODELS.brake.labels.map((label, i) => (
            <div
              key={label.text}
              ref={(el) => {
                labelElements[i] = el;
              }}
              className="absolute start-0 top-0 flex items-center gap-2 whitespace-nowrap will-change-transform"
              style={{ opacity: 0, visibility: "hidden" }}>
              <span className="h-px w-6 bg-accent" />
              <span className="rounded-sm border border-accent/40 bg-bg/85 px-2 py-1 font-mono text-[11px] tracking-[0.14em] text-text-primary uppercase">
                {label.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
