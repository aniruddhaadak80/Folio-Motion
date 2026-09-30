/**
 * Single site configuration module.
 *
 * Every surface — shared header, mobile menu, landing CTA, footer, OpenGraph
 * metadata, sitemap and the MCP manifest — reads the repository and live URLs
 * from here so they can never drift apart.
 */

/** Canonical production origin. Update this on a new deployment. */
const LIVE_URL = "https://folio-motion-aniruddha-adaks-projects.vercel.app";

export const siteConfig = {
  name: "Folio Motion",
  shortName: "Folio Motion",
  tagline: "A motion-physics lab for the browser",
  description:
    "Design spring and bezier motion specs, measure real settle time and overshoot with a numerical physics engine, and export production-ready CSS, Framer Motion, and SVG curve code.",
  repository: "https://github.com/aniruddhaadak80/Folio-Motion",
  live: LIVE_URL,
  // Derived from the live origin so the API and agent endpoints can never drift
  // away from the deployment they belong to.
  api: `${LIVE_URL}/api`,
  mcp: `${LIVE_URL}/api/mcp`,
  author: "Aniruddha Adak",
  authorUrl: "https://github.com/aniruddhaadak80",
  license: "MIT",
  nav: [
    { label: "Lab", href: "/lab" },
    { label: "Specs", href: "/specs" },
    { label: "Signals", href: "/signals" },
    { label: "Agent", href: "/agent" },
    { label: "Method", href: "/method" },
    { label: "Verify", href: "/verify" },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
