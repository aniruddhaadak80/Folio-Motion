import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { OG_CARD_PATH, SITE_URL, absoluteUrl, pageMetadata } from "@/lib/seo";
import { seo } from "@/config/portfolio";

describe("absoluteUrl", () => {
  it("prefixes a root-relative path with the site origin", () => {
    expect(absoluteUrl("/about")).toBe(`${SITE_URL}/about`);
  });

  it("adds the missing leading slash", () => {
    expect(absoluteUrl("about")).toBe(`${SITE_URL}/about`);
  });

  it("leaves an absolute URL alone", () => {
    expect(absoluteUrl("https://example.com/x")).toBe("https://example.com/x");
  });

  it("never doubles the slash between origin and path", () => {
    expect(absoluteUrl("/")).toBe(`${SITE_URL}/`);
    expect(SITE_URL.endsWith("/")).toBe(false);
  });
});

describe("pageMetadata", () => {
  const base = {
    title: "About",
    description: "The longer version.",
    path: "/about",
  };

  it("sets the title, description and canonical path", () => {
    const meta = pageMetadata(base);
    expect(meta.title).toBe("About");
    expect(meta.description).toBe("The longer version.");
    expect(meta.alternates?.canonical).toBe("/about");
  });

  it("builds an OpenGraph card with an absolute url", () => {
    const og = pageMetadata(base).openGraph as {
      type: string;
      url: string;
      siteName: string;
      title: string;
      description: string;
    };
    expect(og.type).toBe("website");
    expect(og.url).toBe(`${SITE_URL}/about`);
    expect(og.title).toBe("About");
    expect(og.description).toBe("The longer version.");
    expect(og.siteName.length).toBeGreaterThan(0);
  });

  it("builds a Twitter card with the same title and description", () => {
    const twitter = pageMetadata(base).twitter as {
      card: string;
      title: string;
      description: string;
      creator: string;
    };
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.title).toBe("About");
    expect(twitter.description).toBe("The longer version.");
    expect(twitter.creator).toBe(seo.twitter);
  });

  it("lets a page opt into the article OpenGraph type", () => {
    const meta = pageMetadata({ ...base, type: "article" });
    expect((meta.openGraph as { type: string }).type).toBe("article");
  });

  it("indexes by default and can opt out", () => {
    expect(pageMetadata(base).robots).toEqual({ index: true, follow: true });
    expect(pageMetadata({ ...base, noIndex: true }).robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it("names the site card as an absolute url", () => {
    const og = pageMetadata(base).openGraph as {
      images: Array<{ url: string; width: number; height: number; alt: string }>;
    };
    expect(og.images).toHaveLength(1);
    expect(og.images[0]!.url).toBe(`${SITE_URL}${OG_CARD_PATH}`);
    expect(og.images[0]!.width).toBe(1200);
    expect(og.images[0]!.height).toBe(630);
    expect(og.images[0]!.alt).toContain("About");
  });

  it("gives the Twitter card the same image", () => {
    const twitter = pageMetadata(base).twitter as { images: string[] };
    expect(twitter.images).toEqual([`${SITE_URL}${OG_CARD_PATH}`]);
  });
});

/**
 * Every route in the app must build its metadata through the helper.
 *
 * A page that hand-rolls its `metadata` object is how a canonical or an
 * OpenGraph card goes missing on one route only, which is exactly the kind
 * of gap nobody notices until a crawler does.
 */
describe("page metadata coverage", () => {
  const appDir = join(process.cwd(), "src", "app");

  function pageFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) return pageFiles(full);
      return entry === "page.tsx" ? [full] : [];
    });
  }

  const pages = pageFiles(appDir);

  it("finds the app routes", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages.map((p) => [p.slice(appDir.length), p]))(
    "%s builds its metadata with pageMetadata()",
    (_name, file) => {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("pageMetadata(");
    },
  );
});
