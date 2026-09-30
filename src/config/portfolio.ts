/**
 * ============================================================================
 *  YOUR PORTFOLIO — edit this file and nothing else.
 * ============================================================================
 *
 *  This is the single source of truth for everything a visitor sees: your
 *  name, photo, bio, projects, skills, experience and links.
 *
 *  Quick guide:
 *    1. Change `personal` — name, role, your photo.
 *    2. Rewrite `about` and `hero` in your own words.
 *    3. Replace the entries in `projects`, `skills` and `experience`.
 *    4. Update `socials` and `links` so they point at your profiles.
 *    5. Delete anything you do not want. Every field is optional except
 *       `personal.name` — empty sections simply do not render.
 *
 *  Nothing here is fetched at build time, so `npm run dev` shows your changes
 *  instantly. No rebuild, no env vars, no database.
 */

import type { LucideIcon } from "lucide-react";
import {
  Code2,
  Layers,
  Palette,
  Gauge,
  Boxes,
  GitBranch,
  Terminal,
  Sparkles,
  Compass,
  type LucideProps,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Personal                                                                  */
/* -------------------------------------------------------------------------- */

export const personal = {
  name: "Aniruddha Adak",
  /** Shown in the browser tab and the footer. */
  shortName: "Aniruddha",
  /** Your job title. Appears under your name. */
  role: "Full-Stack Developer",
  /** One line under your name. Keep it under about 60 characters. */
  tagline: "I build fast, accessible interfaces and measure how they move.",
  /** Rotates in the hero, one phrase at a time. */
  rotatingRoles: [
    "Full-Stack Developer",
    "Interface Engineer",
    "Motion & Interaction",
    "Open Source Builder",
  ],
  /** Your photo. Drop a file in public/images/ and point at it. */
  avatar: "/images/avatar.svg",
  /** Optional second photo shown in the About page. */
  portrait: "/images/portrait.svg",
  /** A few words shown in the About section. */
  shortBio:
    "I design and build web products end to end — from the physics of an animation to the query behind it. I care about interfaces that feel right, not just render.",
  /** The longer version, used on /about. Markdown is not required. */
  longBio: [
    "I build things for the web and I like the parts other people skip. Not just the layout that looks good in a screenshot, but the frame budget behind it, the reason a spring feels bouncy, what happens when the database is cold.",
    "Most of my work sits between design and engineering. That means I can tell you not just that a transition works, but why it works, and what it costs. When I pick an easing curve I know how long it takes to settle and how far it overshoots — because I built the tool that measures it.",
    "Outside of client work I maintain open source, write about the things I get wrong, and try to leave codebases calmer than I found them.",
  ],
  location: "Kolkata, India",
  timezone: "IST (UTC+5:30)",
  email: "hello@example.com",
  /** Shown as a green dot if true. Great for getting freelance work. */
  availableForWork: true,
  availableForWorkText: "Open to new work",
  /** Path to a PDF resume inside public/. Set to null to hide the button. */
  resume: null,
  /** Used for the page title, meta description and social cards. */
  seo: {
    title: "Aniruddha Adak — Full-Stack Developer",
    description:
      "Full-stack developer building fast, accessible web interfaces. I design, build and measure how software moves — with a portfolio template that does the measuring for you.",
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  Socials and links                                                         */
/* -------------------------------------------------------------------------- */

export interface SocialLink {
  label: string;
  href: string;
  /** Shown in the hero and the footer. */
  primary?: boolean;
}

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/aniruddhaadak80", primary: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/aniruddhaadak80", primary: true },
  { label: "X", href: "https://x.com/aniruddhaadak80", primary: true },
  { label: "DEV", href: "https://dev.to/aniruddhaadak", primary: true },
  { label: "Email", href: `mailto:${personal.email}` },
];

/** Buttons in the hero. The first one is styled as the primary action. */
export const heroActions: ReadonlyArray<{ label: string; href: string; primary?: boolean }> = [
  { label: "See my work", href: "/projects", primary: true },
  { label: "About me", href: "/about" },
  { label: "Get in touch", href: "/contact" },
];

/* -------------------------------------------------------------------------- */
/*  Numbers shown in the hero                                                  */
/* -------------------------------------------------------------------------- */

export const heroStats = [
  { value: 4, suffix: "+", label: "Years building", hint: "Shipping production web apps" },
  { value: 30, suffix: "+", label: "Projects shipped", hint: "Products, not demos" },
  { value: 12, suffix: "", label: "Open-source repos", hint: "Published and maintained" },
  { value: 98, suffix: "", label: "Lighthouse avg", hint: "Performance, on real pages" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

export const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Contact", href: "/contact" },
  /** The signature feature. Point this anywhere, or drop it from the list. */
  { label: "Motion Lab", href: "/lab" },
] as const;

/* -------------------------------------------------------------------------- */
/*  What I do                                                                 */
/* -------------------------------------------------------------------------- */

export interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Optional: which of your skills it maps to. */
  skills: string[];
}

export const services: Service[] = [
  {
    icon: Layers,
    title: "Product front-ends",
    description:
      "Interfaces that hold up on a mid-range phone on a bad connection. Semantic HTML, real focus states, motion that respects reduced-motion.",
    skills: ["React", "Next.js", "TypeScript"],
  },
  {
    icon: Gauge,
    title: "Performance work",
    description:
      "Finding the three things costing you the most and fixing them. Bundle size, layout thrash, waterfalls, and the animations that quietly force a repaint every frame.",
    skills: ["Core Web Vitals", "Profiling", "Optimisation"],
  },
  {
    icon: Sparkles,
    title: "Motion & interaction",
    description:
      "Animation that is measured rather than guessed. Settle time, overshoot and onset latency computed from the actual spring, then exported as CSS you can ship.",
    skills: ["Spring physics", "Framer Motion", "Design systems"],
  },
  {
    icon: Compass,
    title: "Technical direction",
    description:
      "Choosing the stack, the shape of the data and the boring parts nobody demos. Architecture that a team can still read six months later.",
    skills: ["Architecture", "Postgres", "APIs"],
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Skills                                                                    */
/* -------------------------------------------------------------------------- */

export interface SkillGroup {
  title: string;
  icon: LucideIcon;
  /** 0-100. Shown as a bar; keep it honest, it is a portfolio. */
  skills: Array<{ name: string; level: number; note?: string }>;
}

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    icon: Code2,
    skills: [
      { name: "TypeScript", level: 92, note: "Daily driver" },
      { name: "JavaScript", level: 95 },
      { name: "Python", level: 78, note: "Data, scripting, tooling" },
      { name: "SQL", level: 80 },
      { name: "HTML & CSS", level: 94 },
    ],
  },
  {
    title: "Frameworks",
    icon: Boxes,
    skills: [
      { name: "React", level: 94 },
      { name: "Next.js", level: 90, note: "App Router" },
      { name: "Tailwind CSS", level: 92 },
      { name: "Node.js", level: 85 },
      { name: "Framer Motion", level: 88 },
    ],
  },
  {
    title: "Design",
    icon: Palette,
    skills: [
      { name: "Design systems", level: 82 },
      { name: "Interaction design", level: 85 },
      { name: "Figma", level: 75 },
      { name: "Motion design", level: 87, note: "The good kind" },
      { name: "Accessibility", level: 86, note: "WCAG AA" },
    ],
  },
  {
    title: "Tooling",
    icon: GitBranch,
    skills: [
      { name: "Git & CI", level: 90 },
      { name: "Vercel", level: 88 },
      { name: "Postgres", level: 82 },
      { name: "Testing", level: 84, note: "Vitest + Playwright" },
      { name: "Linux & tooling", level: 80 },
    ],
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Experience                                                                */
/* -------------------------------------------------------------------------- */

export interface ExperienceEntry {
  role: string;
  company: string;
  /** Use the format "2023 - Present" or "Jan 2023 - Jun 2024". */
  period: string;
  location?: string;
  summary: string;
  highlights: string[];
  tech: string[];
  /** "current" is highlighted in the timeline. */
  status?: "current" | "past";
}

export const experience: ExperienceEntry[] = [
  {
    role: "Senior Full-Stack Engineer",
    company: "Product Studio",
    period: "2024 - Present",
    location: "Remote",
    summary:
      "Lead front-end architecture for a multi-tenant SaaS product. Cut the main bundle by 61% and made the first meaningful paint happen under a second on a throttled connection.",
    highlights: [
      "Rebuilt the dashboard around streamed server components, removing a 340KB client bundle",
      "Introduced a motion system where every transition has a measured settle time, not a guess",
      "Cut p95 API latency by 38% by fixing N+1 queries and adding two covering indexes",
    ],
    tech: ["Next.js", "TypeScript", "Postgres", "React", "Tailwind"],
    status: "current",
  },
  {
    role: "Frontend Engineer",
    company: "Product Studio",
    period: "2022 - 2024",
    location: "Remote",
    summary:
      "Built the customer-facing app and the design system behind it. Owned accessibility and performance as explicit, measured goals rather than a final checklist.",
    highlights: [
      "Shipped a 40-component design system adopted by four product teams",
      "Took the marketing site from 42 to 95 on Lighthouse without adding a framework",
      "Wrote the accessibility guide the whole company now codes against",
    ],
    tech: ["React", "Next.js", "CSS", "Storybook"],
  },
  {
    role: "Full-Stack Developer",
    company: "Agency",
    period: "2021 - 2022",
    location: "Bengaluru, India",
    summary:
      "Delivered client work end to end, from a schema to a launch. Mostly e-commerce and internal tools, usually under a deadline that was already too close.",
    highlights: [
      "Delivered 11 client projects, 9 of them still running a year later",
      "Standardised a checkout flow that lifted conversion 12% on the largest store",
    ],
    tech: ["React", "Node.js", "MongoDB", "Stripe"],
  },
  {
    role: "Frontend Developer",
    company: "Freelance",
    period: "2020 - 2021",
    location: "Remote",
    summary:
      "Learned to scope, quote and ship. Mostly marketing sites and small React apps, built to be handed over cleanly.",
    highlights: [
      "Built 20+ sites, every one handed over with documentation",
      "Turned repeated client requests into a reusable starter kit",
    ],
    tech: ["React", "JavaScript", "Tailwind"],
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Projects                                                                  */
/* -------------------------------------------------------------------------- */

export interface Project {
  /** Used in the URL: /projects/your-slug */
  slug: string;
  title: string;
  /** One line for the card. */
  summary: string;
  /** Longer, shown on the detail page. An array is one paragraph each. */
  description: string[];
  /** Path inside public/images/projects/ */
  image: string;
  tech: string[];
  year: string;
  status?: "live" | "building" | "archived";
  /** Puts it first and makes it bigger on the home page. */
  featured?: boolean;
  links?: {
    live?: string;
    repo?: string;
    caseStudy?: string;
  };
  /** What makes it interesting. Shown as a list on the detail page. */
  highlights?: string[];
  /** The part you are proudest of. */
  proudest?: string;
}

export const projects: Project[] = [
  {
    slug: "folio-motion",
    title: "Folio Motion",
    summary:
      "A portfolio template whose headline feature measures animation instead of guessing at it.",
    description: [
      "Every animation parameter in this template can be scored by a numerical physics engine. The spring equation is integrated at a fixed 240Hz step, and the settle time, overshoot and onset latency you see are measured from that integration, not looked up in a table.",
      "It ships with a real backend, an MCP agent interface, a SHA-384 audit chain, and a browser test suite that runs on desktop and mobile. It is also genuinely easy to make your own, because all the content lives in one file.",
    ],
    image: "/images/projects/folio-motion.svg",
    tech: ["Next.js 16", "TypeScript", "Framer Motion", "Postgres", "MCP", "Playwright"],
    year: "2026",
    status: "live",
    featured: true,
    links: { live: "https://folio-motion.vercel.app", repo: "https://github.com/aniruddhaadak80/Folio-Motion" },
    highlights: [
      "Fixed-step integrator means identical output on every machine",
      "Rest detection needs a velocity condition, or an under-damped spring looks like it never overshoots",
      "Exports CSS with a prefers-reduced-motion block already written for you",
    ],
    proudest:
      "The first version reported zero overshoot for violently bouncing motion. The physics test that caught it is now the one I would point a new contributor at first.",
  },
  {
    slug: "truthlens",
    title: "TruthLens",
    summary:
      "A deterministic credibility analyzer that refracts a creator's public record into explainable signals.",
    description: [
      "TruthLens takes a public YouTube channel and produces a credibility report with eight weighted factors, each with the evidence that produced it. It extracts claims, flags per-video outliers, and tracks how a creator's framing drifts over time.",
      "The interesting part is that every factor is derived from something you can point at in the source, and the whole history is sealed so a report cannot be quietly edited afterwards.",
    ],
    image: "/images/projects/truthlens.svg",
    tech: ["Next.js", "TypeScript", "Postgres", "MCP", "Zod"],
    year: "2026",
    status: "live",
    featured: true,
    links: { live: "https://truthlens-virid.vercel.app", repo: "https://github.com/aniruddhaadak80/truthlens" },
    highlights: [
      "Eight factors with itemised evidence rather than one opaque number",
      "Sealed per-entity hash chain, replayable from a public endpoint",
      "Live data with honestly labelled offline fallback",
    ],
  },
  {
    slug: "upgrade-atelier",
    title: "Upgrade Atelier",
    summary:
      "An explainable dossier for npm dependency upgrades, so 'should we bump this?' has a real answer.",
    description: [
      "Given a package and a version, Upgrade Atelier scores the risk of the upgrade: version distance, release cooldown, maintainer activity, transitive surface and metadata quality. Each factor is itemised so the decision can be argued with.",
      "Specs can be saved, revised, exported as a report, or handed to an agent over MCP. It is what I built after spending too long on the same question by hand.",
    ],
    image: "/images/projects/upgrade-atelier.svg",
    tech: ["Next.js", "TypeScript", "npm registry", "MCP"],
    year: "2026",
    status: "live",
    featured: true,
    links: { repo: "https://github.com/aniruddhaadak80/upgrade-atelier" },
    highlights: [
      "Reads the public npm registry, no API key needed",
      "Risk is itemised, so a teammate can disagree with one factor instead of the whole score",
    ],
  },
  {
    slug: "helio-commons",
    title: "Helio Commons",
    summary:
      "An evidence-first mission board for people tracking where compute and AI investment is actually going.",
    description: [
      "Helio Commons collects public signals, attaches evidence to them, and runs a readiness forecast for each mission rather than presenting a list of links. The forecast is explainable, and the evidence is attached to the thing it justifies.",
      "It reads live NASA and arXiv feeds and labels its own data honestly when a feed is unreachable.",
    ],
    image: "/images/projects/helio-commons.svg",
    tech: ["Next.js", "TypeScript", "arXiv", "Postgres"],
    year: "2025",
    status: "live",
    links: { live: "https://helio-commons.vercel.app", repo: "https://github.com/aniruddhaadak80/helio-commons" },
  },
  {
    slug: "stewardship-ledger",
    title: "Stewardship Ledger",
    summary:
      "A public casebook for AI stewardship, built so accountability leaves the meeting notes.",
    description: [
      "A place to record a stewardship case: what the trade-off was, what authority was granted, what the safeguards were, and who can reverse it. The scoring is a five-factor model with the reasoning attached.",
      "Built for the conversation that usually happens in private and then evaporates.",
    ],
    image: "/images/projects/stewardship-ledger.svg",
    tech: ["Next.js", "TypeScript", "OpenAlex", "Postgres"],
    year: "2025",
    status: "live",
    links: { live: "https://stewardship-ledger.vercel.app", repo: "https://github.com/aniruddhaadak80/stewardship-ledger" },
  },
  {
    slug: "prompt-forge",
    title: "Prompt Forge",
    summary:
      "A workbench that compiles a sourced prompt into a playable artifact you can actually use.",
    description: [
      "Most prompt tools stop at the text. Prompt Forge compiles a prompt into a sandboxed artifact, lets you play it, revise the source, verify the seal and export it.",
      "The point is the round trip: you can see what your prompt became, and change it with the artifact still on screen.",
    ],
    image: "/images/projects/prompt-forge.svg",
    tech: ["Next.js", "TypeScript", "GitHub API", "MCP"],
    year: "2025",
    status: "live",
    links: { live: "https://prompt-forge-neon-one.vercel.app", repo: "https://github.com/aniruddhaadak80/prompt-forge" },
  },
] as const;

/** Tags used by the filter on /projects. Built from the projects above. */
export const projectTags = [
  "Next.js",
  "TypeScript",
  "Postgres",
  "MCP",
  "Framer Motion",
  "Animation",
] as const;

/* -------------------------------------------------------------------------- */
/*  Recognition and currently learning                                          */
/* -------------------------------------------------------------------------- */

export const highlights = [
  { label: "Most useful thing I built", value: "A dependency tree small enough to audit" },
  { label: "Currently learning", value: "GPU-side animation and the WebGPU timeline" },
  { label: "Currently reading", value: "The original Easing Functions paper, again" },
  { label: "Currently shipping", value: "Motion tools that explain themselves" },
] as const;

/* -------------------------------------------------------------------------- */
/*  SEO                                                                       */
/* -------------------------------------------------------------------------- */

export const seo = {
  title: personal.seo.title,
  description: personal.seo.description,
  keywords: [
    "portfolio",
    "developer",
    "next.js",
    "react",
    "typescript",
    "motion design",
    "animation",
    "web developer",
  ],
  /** Set to your own domain once you have one. Used for canonical URLs. */
  siteUrl: "https://folio-motion.vercel.app",
  /** Your own repo, shown in the header, footer and on the landing page. */
  repository: "https://github.com/aniruddhaadak80/Folio-Motion",
  author: personal.name,
  license: "MIT",
  twitter: "@aniruddhaadak80",
} as const;

/* -------------------------------------------------------------------------- */
/*  Derived helpers                                                           */
/* -------------------------------------------------------------------------- */

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** The section anchor ids used by the one-page home layout. */
export const sectionIds = {
  about: "about",
  services: "services",
  skills: "skills",
  work: "work",
  experience: "experience",
  contact: "contact",
} as const;

export type IconComponent = LucideIcon;
export type { LucideProps, Terminal };
