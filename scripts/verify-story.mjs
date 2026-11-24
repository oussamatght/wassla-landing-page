// Verifies the home story in four modes and saves screenshots.
// Usage: node scripts/verify-story.mjs <baseUrl> [outDir]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://127.0.0.1:3200";
const outDir = process.argv[3] ?? "docs/screenshots/home";
mkdirSync(outDir, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

async function scrollToFraction(page, f) {
  await page.evaluate((fraction) => {
    const story = document.querySelector("[data-story]");
    const max = story.offsetTop + story.offsetHeight - window.innerHeight;
    window.scrollTo({ top: Math.max(0, max * fraction), behavior: "instant" });
  }, f);
  await page.waitForTimeout(Number(process.env.SETTLE_MS ?? 1600)); // scrub (0.8 s) + render settle (software GL needs longer)
}

async function run(label, { launchArgs = [], context = {}, query = "", viewport = { width: 1440, height: 900 } }, assertions) {
  const browser = await chromium.launch({ args: launchArgs });
  try {
    const ctx = await browser.newContext({ viewport, ...context });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(`${base}/${query}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500); // idle → tier detection → lazy 3D chunk
    await assertions(page, label);
    check(`${label}: no console errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  } finally {
    await browser.close();
  }
}

const SW = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];

// 1. Full 3D path (forced tier because headless GL is software).
await run("3d-desktop", { launchArgs: SW, query: "?story-tier=high" }, async (page, label) => {
  const mode = await page.getAttribute("[data-story-mode]", "data-story-mode");
  check(`${label}: 3D mode active`, mode === "3d-high", `mode=${mode}`);
  check(`${label}: canvas mounted`, (await page.locator("[data-story-canvas] canvas").count()) === 1);
  const h1 = await page.locator("h1").textContent();
  check(`${label}: H1 server-rendered`, /univers automobile/.test(h1 ?? ""));
  for (const f of [0, 0.2, 0.45, 0.7, 0.95]) {
    await scrollToFraction(page, f);
    await page.screenshot({ path: path.join(outDir, `${label}-scroll-${String(f).replace(".", "_")}.png`) });
  }
  const modeAfter = await page.getAttribute("[data-story-mode]", "data-story-mode");
  if (!modeAfter?.startsWith("3d")) {
    // PerformanceMonitor stepped down to static frames (software GL is slow).
    check(`${label}: low FPS → PerformanceMonitor fell back to static frames`, modeAfter === "fallback", `mode=${modeAfter}`);
    return;
  }
  await scrollToFraction(page, 1);
  const endOpacity = await page.$eval("[data-story-canvas]", (el) => Number(el.style.opacity));
  check(`${label}: canvas fades out at the end`, endOpacity < 0.2, `opacity=${endOpacity}`);
  await scrollToFraction(page, 0.26);
  const midOpacity = await page.$eval("[data-story-canvas]", (el) => Number(el.style.opacity));
  check(`${label}: reverse scroll restores the scene`, midOpacity > 0.9, `opacity=${midOpacity}`);
  const modeNow = await page.getAttribute("[data-story-mode]", "data-story-mode");
  const labelVisible = await page.evaluate(() => {
    const span = [...document.querySelectorAll("[data-story-canvas] span")].find((el) => el.textContent?.normalize("NFC").trim() === "Étrier".normalize("NFC"));
    return span ? getComputedStyle(span.parentElement).visibility : "absent";
  });
  if (modeNow === "3d-low") {
    check(`${label}: PerformanceMonitor downgraded tier → labels removed`, labelVisible === "absent", `mode=${modeNow}`);
  } else {
    check(`${label}: technical labels shown in chapter 1`, labelVisible === "visible", `mode=${modeNow} visibility=${labelVisible}`);
  }
});

// 2. WebGL disabled → static key frames.
await run("no-webgl", { launchArgs: ["--disable-webgl", "--disable-webgl2"] }, async (page, label) => {
  const mode = await page.getAttribute("[data-story-mode]", "data-story-mode");
  check(`${label}: fallback mode`, mode === "fallback", `mode=${mode}`);
  check(`${label}: no canvas`, (await page.locator("canvas").count()) === 0);
  await scrollToFraction(page, 0.45);
  await page.screenshot({ path: path.join(outDir, `${label}-scroll-0_45.png`) });
});

// 3. Reduced motion → no scrub, no canvas, static frames.
await run("reduced-motion", { launchArgs: SW, context: { reducedMotion: "reduce" }, query: "?story-tier=high" }, async (page, label) => {
  const mode = await page.getAttribute("[data-story-mode]", "data-story-mode");
  check(`${label}: reduced-motion mode`, mode === "reduced-motion", `mode=${mode}`);
  check(`${label}: no canvas`, (await page.locator("canvas").count()) === 0);
  await scrollToFraction(page, 0.7);
  await page.screenshot({ path: path.join(outDir, `${label}-scroll-0_7.png`) });
});

// 4. Mobile, low tier.
await run(
  "3d-mobile",
  { launchArgs: SW, query: "?story-tier=low", viewport: { width: 390, height: 844 }, context: { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  async (page, label) => {
    const mode = await page.getAttribute("[data-story-mode]", "data-story-mode");
    check(`${label}: low-tier 3D`, mode === "3d-low", `mode=${mode}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`${label}: no horizontal overflow`, overflow === 0, `${overflow}px`);
    for (const f of [0, 0.26, 0.5, 0.74]) {
      await scrollToFraction(page, f);
      await page.screenshot({ path: path.join(outDir, `${label}-scroll-${String(f).replace(".", "_")}.png`) });
    }
  },
);

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
