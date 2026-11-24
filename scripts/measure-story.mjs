// Dev-only: reads renderer stats (draw calls / triangles) at each chapter key
// frame and tier from /design/story-frame. Usage: node scripts/measure-story.mjs <baseUrl>
import { chromium } from "@playwright/test";
const base = process.argv[2] ?? "http://127.0.0.1:3200";
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
console.log("tier  p     calls  triangles");
for (const tier of ["high", "low"]) {
  for (const p of [0.02, 0.26, 0.4, 0.5, 0.64, 0.74]) {
    await page.goto(`${base}/design/story-frame?p=${p}&tier=${tier}`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-story-canvas] canvas", { timeout: 60000 });
    await page.waitForTimeout(2500);
    const s = await page.evaluate(() => window.__storyStats);
    console.log(`${tier.padEnd(5)} ${String(p).padEnd(5)} ${String(s?.calls).padEnd(6)} ${s?.triangles}`);
  }
}
await browser.close();
