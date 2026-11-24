// Captures the 3D story at fixed progress values from the dev-only
// /design/story-frame route.
// Usage: node scripts/capture-story.mjs <baseUrl> <outDir> <p...> [--fallbacks]
//   --fallbacks  also writes public/fallbacks/chapter-*.webp (1600x900) from the
//                chapter key frames defined in src/three/timeline.config.ts.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const writeFallbacks = args.includes("--fallbacks");
const [baseUrl = "http://127.0.0.1:3200", outDir = "docs/screenshots/story", ...rest] = args.filter((a) => a !== "--fallbacks");
const progresses = rest.length ? rest.map(Number) : [0, 0.2, 0.45, 0.7, 0.95];
mkdirSync(outDir, { recursive: true });

const KEY_FRAMES = [
  { p: 0.02, file: "chapter-0-hero.webp" },
  { p: 0.26, file: "chapter-1-automobile.webp" },
  { p: 0.5, file: "chapter-2-moto.webp" },
  { p: 0.74, file: "chapter-3-heavy.webp" },
  { p: 0.95, file: "chapter-4-marketplace.webp" },
];

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && !/hmr|WebSocket/.test(m.text()) && errors.push(m.text()));

  async function shoot(p, file) {
    await page.goto(`${baseUrl}/design/story-frame?p=${p}&tier=high`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-story-canvas] canvas", { timeout: 60_000 });
    await page.waitForTimeout(3500); // environment + shadows settle (software GL is slow)
    await page.screenshot({ path: file });
  }

  for (const p of progresses) {
    const file = path.join(outDir, `story-p${String(p).replace(".", "_")}.png`);
    await shoot(p, file);
    console.log("captured", file);
  }
  if (writeFallbacks) {
    mkdirSync("public/fallbacks", { recursive: true });
    for (const { p, file } of KEY_FRAMES) {
      const tmp = path.join(outDir, `kf-${p}.png`);
      await shoot(p, tmp);
      const out = path.join("public/fallbacks", file);
      const info = await sharp(tmp).webp({ quality: 72, effort: 5 }).toFile(out);
      console.log("fallback", out, `${Math.round(info.size / 1024)} KB`);
    }
  }
  if (errors.length) console.log("page errors:\n  " + errors.join("\n  "));
} finally {
  await browser.close();
}
