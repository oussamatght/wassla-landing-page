import { describe, expect, it } from "vitest";
import { sample, sampleVec, smooth } from "@/three/math";
import { BRAKE, CAMERA_POSITION, CAMERA_TARGET, CHAPTERS, HEAVY, MOTO, STORY_HEIGHT_VH } from "@/three/timeline.config";
import { MODELS } from "@/three/models.manifest";
import { downgrade, TIER_SETTINGS } from "@/three/device-tier";

describe("timeline maths", () => {
  it("smoothstep is monotonic with fixed ends", () => {
    expect(smooth(0)).toBe(0);
    expect(smooth(1)).toBe(1);
    expect(smooth(0.5)).toBeCloseTo(0.5);
    expect(smooth(0.25)).toBeLessThan(smooth(0.75));
  });

  it("sample clamps outside the track and interpolates inside", () => {
    const track = [[0.2, 0], [0.6, 10]] as const;
    expect(sample(track, 0)).toBe(0);
    expect(sample(track, 1)).toBe(10);
    expect(sample(track, 0.4)).toBeCloseTo(5);
  });

  it("sampleVec writes into the provided array (no allocation)", () => {
    const out: [number, number, number] = [9, 9, 9];
    const result = sampleVec([{ at: 0, value: [0, 0, 0] }, { at: 1, value: [2, 4, 6] }], 0.5, out);
    expect(result).toBe(out);
    expect(out).toEqual([1, 2, 3]);
  });
});

describe("story configuration", () => {
  it("chapters are contiguous, ordered and cover 0 → 1", () => {
    expect(CHAPTERS[0]?.start).toBe(0);
    expect(CHAPTERS[CHAPTERS.length - 1]?.end).toBe(1);
    for (let i = 1; i < CHAPTERS.length; i++) expect(CHAPTERS[i]!.start).toBe(CHAPTERS[i - 1]!.end);
    expect(CHAPTERS.map((c) => c.id)).toEqual(["hero", "automobile", "moto", "heavy", "marketplace"]);
  });

  it("story is ≈ 500vh and every key frame sits inside its chapter", () => {
    expect(STORY_HEIGHT_VH).toBe(500);
    for (const c of CHAPTERS) {
      expect(c.keyFrame).toBeGreaterThanOrEqual(c.start);
      expect(c.keyFrame).toBeLessThanOrEqual(c.end);
      expect(c.fallbackImage).toMatch(/^\/fallbacks\/chapter-\d-[a-z]+\.webp$/);
    }
  });

  it("each chapter shows its own assembly at its key frame", () => {
    const at = (id: string) => CHAPTERS.find((c) => c.id === id)!.keyFrame;
    expect(sample(BRAKE.presence, at("automobile"))).toBe(1);
    expect(sample(MOTO.presence, at("moto"))).toBe(1);
    expect(sample(BRAKE.presence, at("moto"))).toBe(0);
    expect(sample(HEAVY.presence, at("heavy"))).toBe(1);
    expect(sample(MOTO.presence, at("heavy"))).toBe(0);
  });

  it("camera keyframes are sorted and span the story", () => {
    for (const keys of [CAMERA_POSITION, CAMERA_TARGET]) {
      expect(keys[0]?.at).toBe(0);
      expect(keys[keys.length - 1]?.at).toBe(1);
      for (let i = 1; i < keys.length; i++) expect(keys[i]!.at).toBeGreaterThan(keys[i - 1]!.at);
    }
  });

  it("the brake manifest has at most 4 labels and an explode vector per part", () => {
    expect(MODELS.brake.labels.length).toBeLessThanOrEqual(4);
    expect(MODELS.brake.parts.map((p) => p.name)).toEqual(["disc", "hub", "caliper", "padInner", "padOuter", "bolts"]);
    for (const model of Object.values(MODELS)) expect(model.licence).toMatch(/Procedural/);
  });
});

describe("device tiers", () => {
  it("downgrade steps high → mid → low → none", () => {
    expect(downgrade("high")).toBe("mid");
    expect(downgrade("mid")).toBe("low");
    expect(downgrade("low")).toBe("none");
  });

  it("mobile tier respects the DPR and LOD budgets", () => {
    expect(TIER_SETTINGS.low.dpr[1]).toBeLessThanOrEqual(1.25);
    expect(TIER_SETTINGS.mid.dpr[1]).toBeLessThanOrEqual(1.5);
    expect(TIER_SETTINGS.low.shadows).toBe(false);
    expect(TIER_SETTINGS.low.detail).toBeLessThan(TIER_SETTINGS.high.detail);
  });
});
