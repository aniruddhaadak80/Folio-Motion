import type { MetadataRoute } from "next";
import { seo } from "@/config/portfolio";
import { projects } from "@/config/portfolio";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = seo.siteUrl.replace(/\/$/, "");
  const now = new Date();

  const routes = [
    { path: "", priority: 1.0, freq: "weekly" as const },
    { path: "/about", priority: 0.8, freq: "monthly" as const },
    { path: "/projects", priority: 0.9, freq: "weekly" as const },
    { path: "/experience", priority: 0.7, freq: "monthly" as const },
    { path: "/contact", priority: 0.8, freq: "monthly" as const },
    { path: "/lab", priority: 0.8, freq: "monthly" as const },
    { path: "/method", priority: 0.6, freq: "monthly" as const },
    { path: "/agent", priority: 0.6, freq: "monthly" as const },
    { path: "/verify", priority: 0.4, freq: "monthly" as const },
  ];

  return [
    ...routes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: route.freq,
      priority: route.priority,
    })),
    // Every project gets its own entry, read from the config at build time.
    ...projects.map((project) => ({
      url: `${base}/projects/${project.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
