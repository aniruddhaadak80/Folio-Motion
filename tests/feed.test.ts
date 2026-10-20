import { afterEach, describe, expect, it, vi } from "vitest";
import { FEED_REVALIDATE, getFeed, getLibraryStates } from "@/lib/feed";

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const notFound = () => new Response("not found", { status: 404 });

function packument(name: string, latest: string, publishedAt: string) {
  return {
    "dist-tags": { latest },
    versions: { [latest]: { description: `${name} is an animation library` } },
    time: { [latest]: publishedAt },
  };
}

/**
 * Stub the two registry endpoints the feed talks to. `missing` names answer
 * 404, `withoutLatest` answer with a packument that has no dist-tags, and
 * `noDownloads` makes the download counts unavailable.
 */
function stubRegistry(
  options: {
    missing?: string[];
    withoutLatest?: string[];
    noDownloads?: boolean;
    published?: Record<string, string>;
  } = {},
) {
  const missing = new Set(options.missing ?? []);
  const withoutLatest = new Set(options.withoutLatest ?? []);
  const published = options.published ?? {};

  const fetchMock = vi.fn(async (input: string | URL) => {
    const url = String(input);
    if (url.startsWith("https://api.npmjs.org/downloads/")) {
      if (options.noDownloads) return notFound();
      return json({ downloads: 1234 });
    }
    const name = url.replace("https://registry.npmjs.org/", "");
    if (missing.has(name)) return notFound();
    if (withoutLatest.has(name)) {
      return json({ versions: {}, time: {} });
    }
    return json(packument(name, "1.0.0", published[name] ?? "2026-01-15T00:00:00.000Z"));
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getFeed", () => {
  it("serves the sealed sample when the registry is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    const feed = await getFeed();

    expect(feed.status).toBe("fallback");
    expect(feed.libraries).toEqual([]);
    expect(feed.signals.length).toBeGreaterThan(0);
    // The promise the module makes: stale data is never presented as current.
    for (const signal of feed.signals) {
      expect(signal.origin).toBe("fallback");
    }
    expect(feed.sourceName).toContain("sealed sample");
    expect(feed.note).toContain("not current data");
  });

  it("serves live data when the registry answers", async () => {
    stubRegistry();

    const feed = await getFeed();

    expect(feed.status).toBe("live");
    expect(feed.libraries).toHaveLength(5);
    expect(feed.signals).toHaveLength(5);
    for (const signal of feed.signals) {
      expect(signal.origin).toBe("live");
    }
    expect(feed.signals[0]?.summary).toContain("1,234 weekly downloads.");
    expect(feed.signals[0]?.summary).toContain("is an animation library");
  });

  it("drops a library it cannot read instead of failing the feed", async () => {
    stubRegistry({ missing: ["motion"] });

    const feed = await getFeed();

    expect(feed.status).toBe("live");
    expect(feed.libraries.map((library) => library.name)).not.toContain("motion");
    expect(feed.libraries).toHaveLength(4);
  });

  it("drops a packument that names no latest version", async () => {
    stubRegistry({ withoutLatest: ["gsap"] });

    const feed = await getFeed();

    expect(feed.status).toBe("live");
    expect(feed.libraries.map((library) => library.name)).not.toContain("gsap");
  });

  it("still reports a library when the download counts are unavailable", async () => {
    stubRegistry({ noDownloads: true });

    const feed = await getFeed();

    expect(feed.status).toBe("live");
    for (const library of feed.libraries) {
      expect(library.weeklyDownloads).toBeNull();
    }
    // The summary falls back to the description rather than dropping the signal.
    const motion = feed.signals.find((signal) => signal.id === "npm-motion");
    expect(motion?.summary).toBe("motion is an animation library");
  });

  it("orders the signals newest first", async () => {
    stubRegistry({
      published: {
        motion: "2026-03-01T00:00:00.000Z",
        gsap: "2026-01-01T00:00:00.000Z",
        animejs: "2026-02-01T00:00:00.000Z",
      },
    });

    const feed = await getFeed();

    const dates = feed.signals.map((signal) => signal.publishedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
    expect(feed.signals[0]?.id).toBe("npm-motion");
  });
});

describe("getLibraryStates", () => {
  it("reads the latest version and its publish date for every library", async () => {
    stubRegistry();

    const libraries = await getLibraryStates();

    expect(libraries).toHaveLength(5);
    for (const library of libraries) {
      expect(library.latest).toBe("1.0.0");
      expect(library.publishedAt).toBe("2026-01-15T00:00:00.000Z");
      expect(library.weeklyDownloads).toBe(1234);
    }
  });
});

describe("FEED_REVALIDATE", () => {
  it("is a positive cache window", () => {
    expect(FEED_REVALIDATE).toBeGreaterThan(0);
  });
});
