// Usage: node scripts/screenshot.mjs <baseUrl> <outDir> <path> [path...]
// Captures desktop (1440x900) and mobile (390x844) full-page screenshots.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [, , baseUrl = "http://127.0.0.1:3200", outDir = "docs/screenshots", ...routes] = process.argv;
const targets = routes.length ? routes : ["/"];
mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

const browser = await chromium.launch();
try {
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));
    page.on("pageerror", (err) => consoleErrors.push(String(err)));
    for (const route of targets) {
      await page.goto(baseUrl + route, { waitUntil: "networkidle" });
      const slug = route === "/" ? "home" : route.replace(/^\/+/, "").replace(/[^a-z0-9]+/gi, "-");
      const file = path.join(outDir, `${slug}-${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      console.log(`${file}  horizontalOverflow=${overflow}px`);
    }
    if (consoleErrors.length) console.log(`[${vp.name}] console errors:\n  ` + consoleErrors.join("\n  "));
    await context.close();
  }
} finally {
  await browser.close();
}
