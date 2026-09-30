/**
 * Generates the placeholder project covers in public/images/projects/.
 * Run once with:  node scripts/generate-project-images.mjs
 * Replace any of them with a real screenshot at the same path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "images", "projects");
mkdirSync(outDir, { recursive: true });

/**
 * @param {string} title
 * @param {string} tag
 * @param {string[]} palette  three hex colours
 * @param {string} glyph       a tiny inline motif drawn into the cover
 */
const covers = [
  {
    file: "folio-motion.svg",
    title: "Folio Motion",
    tag: "motion",
    palette: ["#c8f542", "#241b2f", "#3a2b52"],
    motif: `<path d="M20 150 C 90 20, 210 20, 280 150" fill="none" stroke="#c8f542" stroke-width="7" stroke-linecap="round"/>
           <circle cx="150" cy="63" r="12" fill="#f4f1e8"/>
           <line x1="20" y1="168" x2="280" y2="168" stroke="#6b5c7e" stroke-width="2"/>`,
  },
  {
    file: "truthlens.svg",
    title: "TruthLens",
    tag: "analysis",
    palette: ["#22d3ee", "#0b1b26", "#123a4d"],
    motif: `<path d="M20 90 L150 90 L280 170" fill="none" stroke="#22d3ee" stroke-width="5"/>
           <path d="M20 170 L150 90 L280 90" fill="none" stroke="#22d3ee" stroke-width="5" opacity="0.55"/>
           <circle cx="150" cy="90" r="11" fill="#f4f1e8"/>`,
  },
  {
    file: "upgrade-atelier.svg",
    title: "Upgrade Atelier",
    tag: "deps",
    palette: ["#fbbf24", "#2a1f0c", "#4a3410"],
    motif: `<rect x="42" y="112" width="44" height="56" fill="#fbbf24" opacity="0.85"/>
           <rect x="118" y="88" width="44" height="80" fill="#fbbf24"/>
           <rect x="194" y="60" width="44" height="108" fill="#f4f1e8" opacity="0.9"/>`,
  },
  {
    file: "helio-commons.svg",
    title: "Helio Commons",
    tag: "signals",
    palette: ["#fb7185", "#2a1220", "#4a1f33"],
    motif: `<circle cx="150" cy="110" r="46" fill="none" stroke="#fb7185" stroke-width="5"/>
           <ellipse cx="150" cy="110" rx="86" ry="26" fill="none" stroke="#fb7185" stroke-width="3" opacity="0.6"/>
           <circle cx="236" cy="110" r="9" fill="#f4f1e8"/>`,
  },
  {
    file: "stewardship-ledger.svg",
    title: "Stewardship Ledger",
    tag: "governance",
    palette: ["#34d399", "#0d2620", "#14453a"],
    motif: `<rect x="52" y="52" width="196" height="116" fill="none" stroke="#34d399" stroke-width="5"/>
           <path d="M52 92h196M52 128h196" stroke="#34d399" stroke-width="3" opacity="0.55"/>
           <circle cx="212" cy="72" r="8" fill="#f4f1e8"/>`,
  },
  {
    file: "prompt-forge.svg",
    title: "Prompt Forge",
    tag: "prompts",
    palette: ["#a78bfa", "#1c1630", "#332552"],
    motif: `<path d="M62 74h84l-18 26 18 26H62" fill="none" stroke="#a78bfa" stroke-width="5" stroke-linejoin="round"/>
           <path d="M238 74h-84l18 26-18 26h84" fill="none" stroke="#f4f1e8" stroke-width="5" stroke-linejoin="round" opacity="0.75"/>`,
  },
  {
    file: "placeholder.svg",
    title: "Project",
    tag: "replace me",
    palette: ["#6b5c7e", "#1c1826", "#2c2438"],
    motif: `<rect x="50" y="56" width="200" height="108" fill="none" stroke="#6b5c7e" stroke-width="4"/>
           <circle cx="98" cy="96" r="12" fill="#6b5c7e"/>
           <path d="M50 148l58-52 44 40 32-28 66 40" fill="none" stroke="#6b5c7e" stroke-width="4"/>`,
  },
];

for (const cover of covers) {
  const [ink, deep, mid] = cover.palette;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-label="${cover.title} cover">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${mid}"/>
      <stop offset="100%" stop-color="${deep}"/>
    </linearGradient>
    <pattern id="p" width="22" height="22" patternUnits="userSpaceOnUse">
      <path d="M22 0H0V22" fill="none" stroke="#ffffff" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="400" height="300" fill="url(#g)"/>
  <rect width="400" height="300" fill="url(#p)"/>
  <rect x="0" y="0" width="400" height="6" fill="${ink}" opacity="0.8"/>
  <rect x="0" y="294" width="400" height="6" fill="${ink}" opacity="0.8"/>
  ${cover.motif}
  <text x="24" y="40" font-family="ui-monospace, monospace" font-size="15" fill="#f4f1e8" opacity="0.92" letter-spacing="0.5">${cover.title}</text>
  <text x="24" y="272" font-family="ui-monospace, monospace" font-size="12" fill="${ink}" opacity="0.95" letter-spacing="2">${cover.tag.toUpperCase()}</text>
</svg>
`;
  writeFileSync(join(outDir, cover.file), svg, "utf8");
}

console.log(`wrote ${covers.length} covers to public/images/projects/`);
