# 3D pipeline — scroll story

## Source of each model

| Model | Path used | Why |
|---|---|---|
| Brake assembly: ventilated cross-drilled disc, hat/hub, caliper, pads, bolts | **3. Procedural (code)**: `src/three/geometry.ts`, `src/three/models/BrakeAssembly.tsx` | No licensed 3D models were available, so the geometry is generated in code. |
| Moto: 42-tooth sprocket with lightening holes, roller chain, wave disc | **3. Procedural**: `MotoAssembly.tsx` | Same reason |
| Truck turbocharger: twisted-blade compressor wheel, split housings, finned centre housing, turbine housing | **3. Procedural**: `TurboAssembly.tsx` | Same reason |

These are honest procedural "kit-bashed" assemblies, not photogrammetry or artist models:
- extruded shapes with real holes (drilled disc, sprocket, petal disc, caliper window);
- lathe profiles (hub, compressor nose, housings);
- instanced vanes, bolts, chain plates and rollers;
- blades twisted by vertex displacement.

Every part is a named, separate mesh or group, as the explode animation requires.

## Manifest and swap path

`src/three/models.manifest.ts` lists, per model: id, source, part names, explode vectors, label anchors, scale, triangle budget and licence.

To use a professional GLB later:
1. Model it with **the same part names** (`disc`, `hub`, `caliper`, `padInner`, `padOuter`, `bolts`; `sprocket`, `chain`, `disc`; `compressorWheel`, `compressorHousingLeft/Right`, `centerHousing`, `turbineHousing`).
2. Optimise it:
   ```bash
   npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 1024
   ```
   (Or `--compress draco`; KTX2 via `--texture-compress ktx2`.) Target: ≤ 2.5 MB total desktop, ≤ 1.2 MB mobile LOD.
3. Set `source: { kind: "glb", url: "/models/brake.glb" }` and load it with drei `useGLTF`, mapping nodes by name. `timeline.config.ts` and the explode logic stay unchanged.

## Look

- **Lighting:** drei `<Environment>` built from `<Lightformer>`s (white key strip, white fill, cyan and violet side strips, blue ring), rendered once. No HDRI file is downloaded, so zero bytes over the network.
- **Lights:** a hemisphere fill, a white key, a soft front fill, a cyan rim point light (left/back) and a violet rim point light (right/back).
- **Rendering:** ACES Filmic tone mapping (exposure 1.05), sRGB output, transparent canvas over the page colour.
- **Materials:** `MeshPhysicalMaterial` steel, cast iron (metal, roughness 0.42), anodised alloy, and a clear-coated caliper (clearcoat 1, roughness 0.32).
- **Post-processing:** none. Bloom/SMAA were skipped to stay inside budget, and the rims read well without them.
- **High tier only:** drei `ContactShadows` as a soft floor shadow.

## Measured budgets

| Metric | Budget | Measured | How |
|---|---|---|---|
| Draw calls | ≤ 150 | **5–12** (desktop and mobile) | `scripts/measure-story.mjs` → `renderer.info` at chapter key frames |
| Triangles, desktop (incl. contact-shadow pass) | ≤ 300 k | **9 k – 39 k** | same |
| Triangles, mobile LOD (`low` tier) | ≤ 80 k | **6 k – 26 k** | same |
| 3D model payload | ≤ 2.5 MB / 1.2 MB | **0 KB**: geometry is generated at runtime | — |
| Lazy 3D JS chunk (three + R3F + drei + scene) | n/a | **271 KB** compressed, loaded on idle, only for capable devices | `scripts/measure-payload.mjs` (production build) |
| Initial JS of `/` (excludes the 3D chunk) | < 200 KB gzip | **185.6 KB gzip** | `scripts/measure-initial-js.mjs` (production build) |
| Fallback images (5 chapters) | — | **80 KB** total (WebP, 1600×900) | `public/fallbacks/` |

**First optimisation pass.** Triangles were initially 354 k desktop / 160 k mobile. Three.js samples every arc at `curveSegments × 2`, even the tiny drilled holes. Holes are now explicit polygons, and chain plates have no bevel, which brought the count to the figures above.

## Device tiers and fallbacks (`src/three/device-tier.ts`, `StoryStage.tsx`)

| Tier | When | Settings |
|---|---|---|
| high | desktop, ≥ 8 cores, ≥ 8 GB (when reported) | DPR ≤ 2, full detail, labels, contact shadows |
| mid | other desktops, capable tablets | DPR ≤ 1.5, detail 0.8, labels, no shadows |
| low | phones / coarse pointer / Save-Data | DPR ≤ 1.25, detail 0.5 (mobile LOD), no labels, no shadows |
| none | no WebGL, software renderer (SwiftShader/llvmpipe), context lost | static chapter key frames |

**Behaviour:**
- `detect-gpu` was not used, because it fetches benchmark tables from a third-party CDN.
- **`PerformanceMonitor`**: when FPS drops below 45 (two declines), the scene steps down one tier, ending at the static frames. This was verified: under headless software GL the scene stepped `high → low → fallback` on its own.
- **`prefers-reduced-motion`**: no scrub, no camera movement, no canvas. Chapter key frames are swapped as the visitor scrolls, and all content stays in the HTML panels.
- **Rendering pauses** when the story section is off-screen (IntersectionObserver) or the tab is hidden (`frameloop="never"`).
- **QA override:** `?story-tier=high|mid|low` forces a tier, and still requires WebGL. It's used by the scripts because headless Chromium renders WebGL in software.

## Fallback images

- Rendered from the real scene by `node scripts/capture-story.mjs <devUrl> <outDir> --fallbacks`.
- The script uses the dev-only route `/design/story-frame?p=<progress>&tier=high` (404 in production) and the chapter key frames from `timeline.config.ts`.
- **Re-run it whenever the scene or the timeline changes.**

## Assets that would raise quality

- Artist-made, licensed GLBs of a brake assembly, a motorcycle final drive and a truck turbocharger, each with separate parts and PBR textures. These would replace the procedural geometry through the manifest.
- A small CC0 studio HDRI (1k, e.g. Poly Haven) bundled locally, for richer reflections on high-end devices.
