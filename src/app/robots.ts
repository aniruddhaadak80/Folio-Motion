import type { MetadataRoute } from "next";
import { seo } from "@/config/portfolio";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = seo.siteUrl.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API routes and session-scoped pages have nothing indexable.
        disallow: ["/api/", "/agent"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
