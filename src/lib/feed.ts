/**
 * Live public feed.
 *
 * Folio Motion reads the live state of the animation libraries it advises on,
 * straight from the public npm registry. No API key, no account, no SDK.
 *
 * A sealed offline sample ships with the app so a build or a first paint can
 * never break. When the fallback is served the response says so explicitly via
 * `status: "fallback"` and every signal is marked `origin: "fallback"` —
 * stale data is never presented as current.
 */

import type { FeedResponse, FeedSignal } from "./types";

const REGISTRY = "https://registry.npmjs.org";
const TRACKED = [
  "motion",
  "framer-motion",
  "react-spring",
  "gsap",
  "animejs",
] as const;

const REQUEST_TIMEOUT_MS = 4500;
const REVALIDATE_SECONDS = 900;

export interface LibraryState {
  name: string;
  latest: string;
  publishedAt: string;
  weeklyDownloads: number | null;
  description: string;
}

function fallbackSignals(): FeedSignal[] {
  const base = Date.UTC(2026, 0, 15, 12, 0, 0);
  return [
    {
      id: "fallback-motion",
      sourceId: "motion@12.x",
      title: "motion — declarative animation library",
      url: "https://www.npmjs.com/package/motion",
      publishedAt: new Date(base).toISOString(),
      origin: "fallback",
      sourceName: "npm registry (sealed sample)",
      summary: "Hybrid animation engine combining WAAPI, springs and independent transforms.",
    },
    {
      id: "fallback-gsap",
      sourceId: "gsap@3.x",
      title: "gsap — professional-grade timeline animation",
      url: "https://www.npmjs.com/package/gsap",
      publishedAt: new Date(base - 86400000 * 6).toISOString(),
      origin: "fallback",
      sourceName: "npm registry (sealed sample)",
      summary: "Timeline-based sequencing with a large easing and plugin ecosystem.",
    },
    {
      id: "fallback-animejs",
      sourceId: "animejs@4.x",
      title: "animejs — lightweight runtime animation",
      url: "https://www.npmjs.com/package/animejs",
      publishedAt: new Date(base - 86400000 * 12).toISOString(),
      origin: "fallback",
      sourceName: "npm registry (sealed sample)",
      summary: "Small runtime for keyframes, timelines and scroll-linked effects.",
    },
  ];
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json", "user-agent": "folio-motion-lab" },
    });
    if (!res.ok) throw new Error(`upstream responded ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function readLibrary(name: string): Promise<LibraryState | null> {
  try {
    const doc = (await fetchJson(`${REGISTRY}/${encodeURIComponent(name)}`)) as {
      "dist-tags"?: { latest?: string };
      versions?: Record<string, { description?: string }>;
      time?: Record<string, string>;
    };
    const latest = doc["dist-tags"]?.latest;
    if (!latest) return null;
    const publishedAt = doc.time?.[latest] ?? new Date(0).toISOString();

    let weeklyDownloads: number | null = null;
    try {
      const stats = (await fetchJson(
        `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`,
      )) as { downloads?: number };
      weeklyDownloads = typeof stats.downloads === "number" ? stats.downloads : null;
    } catch {
      weeklyDownloads = null;
    }

    return {
      name,
      latest,
      publishedAt,
      weeklyDownloads,
      description: doc.versions?.[latest]?.description ?? "",
    };
  } catch {
    return null;
  }
}

export async function getLibraryStates(): Promise<LibraryState[]> {
  const results = await Promise.all(TRACKED.map((name) => readLibrary(name)));
  return results.filter((r): r is LibraryState => r !== null);
}

export async function getFeed(): Promise<FeedResponse & { libraries: LibraryState[] }> {
  const fetchedAt = new Date().toISOString();
  let libraries: LibraryState[] = [];
  try {
    libraries = await getLibraryStates();
  } catch {
    libraries = [];
  }

  if (libraries.length === 0) {
    return {
      signals: fallbackSignals(),
      libraries: [],
      status: "fallback",
      sourceName: "npm registry (sealed sample)",
      fetchedAt,
      note: "Live registry unreachable. Showing a sealed sample dated 2026-01-15, not current data.",
    };
  }

  const signals: FeedSignal[] = libraries.map((lib) => ({
    id: `npm-${lib.name}`,
    sourceId: `${lib.name}@${lib.latest}`,
    title: `${lib.name}@${lib.latest}`,
    url: `https://www.npmjs.com/package/${lib.name}`,
    publishedAt: lib.publishedAt,
    origin: "live",
    sourceName: "npm registry",
    summary:
      lib.weeklyDownloads !== null
        ? `${lib.weeklyDownloads.toLocaleString("en-US")} weekly downloads. ${lib.description}`
        : lib.description,
  }));

  signals.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return {
    signals,
    libraries,
    status: "live",
    sourceName: "npm registry",
    fetchedAt,
    note: `Live registry data for ${libraries.length} animation libraries, cached ${REVALIDATE_SECONDS}s.`,
  };
}

export const FEED_REVALIDATE = REVALIDATE_SECONDS;
