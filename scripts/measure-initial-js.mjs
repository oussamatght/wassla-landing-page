// Sums the gzip size of every <script src> in the server-rendered HTML of a
// route = JS required before the page is interactive (lazy chunks excluded).
// Usage: node scripts/measure-initial-js.mjs <baseUrl> [route]
import { gzipSync } from "node:zlib";
const base = process.argv[2] ?? "http://127.0.0.1:3300";
const route = process.argv[3] ?? "/";
const html = await (await fetch(base + route)).text();
const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
let total = 0;
for (const src of srcs) {
  const buf = Buffer.from(await (await fetch(new URL(src, base))).arrayBuffer());
  const gz = gzipSync(buf, { level: 9 }).length;
  total += gz;
  console.log(`${(gz / 1024).toFixed(1).padStart(7)} KB  ${src}`);
}
const lazy = /three|fiber|drei/.test(html) ? " (WARNING: 3D code referenced in initial HTML)" : "";
console.log(`\n${route}: ${srcs.length} initial scripts, ${(total / 1024).toFixed(1)} KB gzip${lazy}`);
