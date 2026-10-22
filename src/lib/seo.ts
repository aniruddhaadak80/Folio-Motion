import type { Metadata } from "next";
import { personal, seo } from "@/config/portfolio";

/**
 * SEO metadata helpers.
 *
 * Every page in this app needs the same five things: a title, a description,
 * a canonical URL, an OpenGraph card and a Twitter card. Writing them by hand
 * per page is how they drift — one page gets a canonical, the next one does
 * not, and the social preview silently falls back to the site-wide card.
 *
 * `pageMetadata` builds all five from one call so they cannot drift apart.
 * It is a pure function, so it is unit tested like the rest of `src/lib`.
 */

/** The site origin without a trailing slash. */
export const SITE_URL = seo.siteUrl.replace(/\/+$/, "");

/** The name used for `og:site_name`. */
export const SITE_NAME = `${personal.name} — Portfolio`;

/**
 * The card rendered by `src/app/opengraph-image.tsx`.
 *
 * The path has to be named explicitly rather than inherited. Next.js replaces
 * the whole `openGraph` object on any page that defines one, so a page with
 * its own card loses the file-based image the root layout would have given
 * it. Naming the route here keeps every page's card identical to the
 * site-wide one instead of silently dropping it.
 */
export const OG_CARD_PATH = "/opengraph-image";

/** The dimensions the card is rendered at. */
export const OG_CARD_SIZE = { width: 1200, height: 630 } as const;

/**
 * Turn a path into an absolute URL.
 *
 * Absolute URLs are required for OpenGraph and Twitter cards: those tags are
 * read by crawlers that fetch the page from a different origin, so a relative
 * path is useless to them. Already-absolute URLs are passed through
 * untouched.
 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface PageMetadataInput {
  /** Page title. The layout appends the site name to it. */
  title: string;
  /** Meta description. Aim for 50–160 characters. */
  description: string;
  /** Canonical path, with a leading slash — e.g. `/about`. */
  path: string;
  /** OpenGraph type. Most pages are `website`; a case study is `article`. */
  type?: "website" | "article";
  /** Set to true for pages that should stay out of the index. */
  noIndex?: boolean;
}

/**
 * Build a complete `Metadata` object for a page.
 *
 * Every page gets the same card image, the same site name and the same
 * creator handle, and only the title, description, URL and type change. That
 * is deliberate: a social preview of `/about` should still be recognisably
 * this site, just labelled with the page it came from.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const card = [
    {
      url: absoluteUrl(OG_CARD_PATH),
      width: OG_CARD_SIZE.width,
      height: OG_CARD_SIZE.height,
      alt: `${title} — ${personal.name}`,
    },
  ];

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: card,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: seo.twitter,
      images: card.map((image) => image.url),
    },
  };
}
