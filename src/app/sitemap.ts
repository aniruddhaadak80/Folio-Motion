import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.live.replace(/\/$/, "");
  const now = new Date();

  const routes = [
    { path: "", priority: 1.0, freq: "weekly" as const },
    { path: "/lab", priority: 0.95, freq: "weekly" as const },
    { path: "/method", priority: 0.8, freq: "monthly" as const },
    { path: "/signals", priority: 0.7, freq: "daily" as const },
    { path: "/agent", priority: 0.7, freq: "monthly" as const },
    { path: "/specs", priority: 0.6, freq: "weekly" as const },
    { path: "/verify", priority: 0.5, freq: "monthly" as const },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.freq,
    priority: route.priority,
  }));
}
