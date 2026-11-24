"use client";

import { useEffect, useMemo } from "react";
import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from "three";

/**
 * Shared PBR materials (created once per scene, disposed on unmount).
 * "Night garage": brushed steel, cast iron, anodised alloy, clear-coated
 * caliper. Transparent so assemblies can fade in/out with `presence`.
 */
export function useMaterials() {
  const materials = useMemo(() => {
    const steel = new MeshPhysicalMaterial({
      color: new Color("#a7adb6"),
      metalness: 1,
      roughness: 0.32,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
      transparent: true,
    });
    const steelDark = new MeshPhysicalMaterial({
      color: new Color("#6e747e"),
      metalness: 1,
      roughness: 0.4,
      transparent: true,
    });
    const castIron = new MeshPhysicalMaterial({
      color: new Color("#7a808a"),
      metalness: 1,
      roughness: 0.42,
      clearcoat: 0.1,
      transparent: true,
    });
    const caliper = new MeshPhysicalMaterial({
      color: new Color("#b0162c"),
      metalness: 0.35,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transparent: true,
    });
    const anodised = new MeshPhysicalMaterial({
      color: new Color("#d8dde6"),
      metalness: 0.92,
      roughness: 0.3,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
      transparent: true,
    });
    const friction = new MeshStandardMaterial({
      color: new Color("#26272c"),
      metalness: 0.2,
      roughness: 0.92,
      transparent: true,
    });
    const chain = new MeshPhysicalMaterial({
      color: new Color("#8a9099"),
      metalness: 1,
      roughness: 0.38,
      transparent: true,
    });
    return { steel, steelDark, castIron, caliper, anodised, friction, chain };
  }, []);

  useEffect(
    () => () => {
      Object.values(materials).forEach((m) => m.dispose());
    },
    [materials],
  );

  return materials;
}

export type SceneMaterials = ReturnType<typeof useMaterials>;

/** Applies a group-wide opacity to the given materials (presence fades). */
export function setOpacity(list: Array<MeshStandardMaterial | MeshPhysicalMaterial>, opacity: number) {
  for (const m of list) {
    m.opacity = opacity;
    m.depthWrite = opacity > 0.98;
    m.visible = opacity > 0.01;
  }
}
