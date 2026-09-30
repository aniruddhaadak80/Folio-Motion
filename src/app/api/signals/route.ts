import { NextResponse } from "next/server";
import { getFeed, FEED_REVALIDATE } from "@/lib/feed";

export const runtime = "nodejs";
export const revalidate = 900;

/**
 * Live animation-library state from the public npm registry.
 * The response always states whether it is `live` or `fallback`.
 */
export async function GET() {
  const feed = await getFeed();
  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": `public, s-maxage=${FEED_REVALIDATE}, stale-while-revalidate=${FEED_REVALIDATE}`,
    },
  });
}
