import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.live.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Session-scoped pages have nothing indexable and no canonical host.
        disallow: ["/api/", "/specs/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
