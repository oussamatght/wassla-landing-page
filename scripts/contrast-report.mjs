// WCAG 2.1 contrast report for every text/background pair used by the design
// system. Exits with code 1 if any pair fails its required ratio.
// Usage: node scripts/contrast-report.mjs [--markdown]
const T = {
  bg: "#020523",
  "surface-1": "#071034",
  "surface-2": "#0b1643",
  "surface-3": "#111f57",
  "text-primary": "#f7f8ff",
  "text-secondary": "#b9c0e3",
  "text-muted": "#939cc8",
  accent: "#30eefd",
  "on-accent": "#020523",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#fb7185",
  sponsored: "#d97ffe",
  // CTA gradient stops (white text sits on all of them)
  "cta-start": "#0b6bd6",
  "cta-mid": "#145dff",
  "cta-end": "#5b2cfd",
  white: "#ffffff",
  "navy-950": "#020523",
};

function luminance(hex) {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// [foreground, background, minimum ratio, usage]
const pairs = [];
for (const bg of ["bg", "surface-1", "surface-2", "surface-3"]) {
  pairs.push(["text-primary", bg, 4.5, "body text"]);
  pairs.push(["text-secondary", bg, 4.5, "secondary text"]);
  pairs.push(["text-muted", bg, 4.5, "captions, meta"]);
  pairs.push(["accent", bg, 4.5, "links, active labels"]);
  pairs.push(["success", bg, 4.5, "status text"]);
  pairs.push(["warning", bg, 4.5, "status text"]);
  pairs.push(["danger", bg, 4.5, "errors"]);
  pairs.push(["sponsored", bg, 4.5, "Sponsorisé badge text"]);
}
pairs.push(["on-accent", "accent", 4.5, "text on cyan fill"]);
pairs.push(["white", "cta-start", 4.5, "CTA label (gradient start)"]);
pairs.push(["white", "cta-mid", 4.5, "CTA label (gradient middle)"]);
pairs.push(["white", "cta-end", 4.5, "CTA label (gradient end)"]);
pairs.push(["navy-950", "warning", 4.5, "demo ribbon"]);
pairs.push(["accent", "bg", 3, "focus ring (non-text, 1.4.11)"]);

const markdown = process.argv.includes("--markdown");
let failures = 0;
const rows = pairs.map(([fg, bg, min, usage]) => {
  const r = ratio(T[fg], T[bg]);
  const ok = r >= min;
  if (!ok) failures++;
  return { fg, bg, r, min, ok, usage };
});

if (markdown) {
  console.log("| Foreground | Background | Ratio | Required | Result | Usage |");
  console.log("|---|---|---|---|---|---|");
  for (const x of rows) {
    console.log(`| ${x.fg} \`${T[x.fg]}\` | ${x.bg} \`${T[x.bg]}\` | ${x.r.toFixed(2)}:1 | ${x.min}:1 | ${x.ok ? "PASS" : "**FAIL**"} | ${x.usage} |`);
  }
} else {
  for (const x of rows) {
    console.log(`${x.ok ? "PASS" : "FAIL"}  ${x.r.toFixed(2).padStart(5)}:1 (min ${x.min})  ${x.fg} on ${x.bg}  — ${x.usage}`);
  }
}
console.log(`\n${rows.length - failures}/${rows.length} pairs pass WCAG AA.`);
process.exit(failures ? 1 : 0);
