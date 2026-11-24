// Samples the official logo (public/brand/wassla-logo.png) to refine the
// brand tokens.
// Usage: node scripts/sample-logo-colors.mjs
import sharp from "sharp";

const FILE = "public/brand/wassla-logo.png";
const { data, info } = await sharp(FILE).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const hex = (r, g, b) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
function px(x, y) {
  const i = (Math.round(y) * width + Math.round(x)) * channels;
  return [data[i], data[i + 1], data[i + 2]];
}
function avg(x, y, r = 4) {
  let s = [0, 0, 0], n = 0;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const p = px(x + dx, y + dy); s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; n++;
  }
  return s.map((v) => v / n);
}
function hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}

// Named probes (coordinates measured on the 1254×1254 artwork).
const probes = {
  "background corner (top-left)": [30, 30],
  "background centre-bottom": [627, 1200],
  "background top-right glow": [1200, 60],
  "W left stroke top (cyan)": [250, 305],
  "W left stroke middle (blue)": [380, 520],
  "W bottom-left loop (blue)": [470, 640],
  "W centre crest (lavender)": [600, 380],
  "W right stroke top (lavender/violet)": [1000, 300],
  "W right stroke middle (violet)": [870, 520],
  "W bottom-right loop (violet)": [780, 640],
  "wordmark white": [1050, 860],
};

console.log(`Logo ${FILE}: ${width}x${height}, ${channels} channels\n`);
for (const [name, [x, y]] of Object.entries(probes)) {
  const c = avg(x, y);
  const { h, s, l } = hsl(c);
  console.log(`${name.padEnd(40)} ${hex(...c)}  h=${h.toFixed(0)} s=${(s * 100).toFixed(0)}% l=${(l * 100).toFixed(0)}%`);
}

// Extremes of the saturated W mark (rows 280–690): most cyan and most violet.
let cyan = null, violet = null, darkest = null;
for (let y = 280; y < 690; y += 2) for (let x = 220; x < 1040; x += 2) {
  const c = px(x, y), { h, s, l } = hsl(c);
  if (s < 0.6 || l < 0.35 || l > 0.85) continue;
  if (h >= 175 && h <= 200 && (!cyan || l > cyan.l)) cyan = { c, l };
  if (h >= 255 && h <= 285 && (!violet || s > violet.s)) violet = { c, s };
}
for (let y = 0; y < height; y += 6) for (let x = 0; x < width; x += 6) {
  const c = px(x, y), { l } = hsl(c);
  if (!darkest || l < darkest.l) darkest = { c, l };
}
console.log("\nMost luminous cyan in the mark:", cyan && hex(...cyan.c));
console.log("Most saturated violet in the mark:", violet && hex(...violet.c));
console.log("Darkest background pixel:", darkest && hex(...darkest.c));
