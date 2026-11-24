// Measures JS transferred (compressed) on the home page: initial load (3D
// disabled via no-WebGL) vs. with the lazy 3D chunk (forced tier).
// Usage: node scripts/measure-payload.mjs <baseUrl>
import { chromium } from "@playwright/test";
const base = process.argv[2] ?? "http://127.0.0.1:3300";
async function measure(label, args, query) {
  const browser = await chromium.launch({ args });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  const sizes = new Map();
  cdp.on("Network.responseReceived", (e) => sizes.set(e.requestId, { url: e.response.url, type: e.type, enc: 0 }));
  cdp.on("Network.loadingFinished", (e) => { const s = sizes.get(e.requestId); if (s) s.enc = e.encodedDataLength; });
  await page.goto(base + "/" + query, { waitUntil: "load" });
  await page.waitForTimeout(6000);
  const all = [...sizes.values()];
  const js = all.filter((r) => r.type === "Script");
  const kb = (n) => (n / 1024).toFixed(1) + " KB";
  const total = js.reduce((s, r) => s + r.enc, 0);
  const other = all.filter((r) => r.type !== "Script").reduce((s, r) => s + r.enc, 0);
  console.log(`${label}: ${js.length} JS files, ${kb(total)} JS transferred; other resources ${kb(other)}`);
  js.sort((a, b) => b.enc - a.enc).slice(0, 4).forEach((r) => console.log("   ", kb(r.enc).padStart(9), r.url.replace(base, "")));
  await browser.close();
  return total;
}
const initial = await measure("initial (no WebGL)", ["--disable-webgl", "--disable-webgl2"], "");
const with3d = await measure("with 3D (forced)", ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"], "?story-tier=high");
console.log(`\nlazy 3D chunk(s) ≈ ${((with3d - initial) / 1024).toFixed(1)} KB compressed`);
