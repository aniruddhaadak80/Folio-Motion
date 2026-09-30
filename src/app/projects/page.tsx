import type { Metadata } from "next";
import { Suspense } from "react";
import { projects, projectTags } from "@/config/portfolio";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { ProjectFilters } from "@/components/project-filters";
import { Reveal } from "@/components/motion-primitives";

export const metadata: Metadata = {
  title: "Projects",
  description: `Selected work, with the hard parts written down. ${projects.length} case studies.`,
  alternates: { canonical: "/projects" },
};

/** Pre-render the unfiltered list; any ?tag= is a client-side refinement. */
export function generateStaticParams() {
  return [{}];
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const active = tag && projectTags.includes(tag as (typeof projectTags)[number]) ? tag : "all";

  // Build the filter list and counts from the same source as the cards, so a
  // tag can never appear with a stale or impossible count.
  const counts: Record<string, number> = {};
  for (const project of projects) {
    for (const tech of project.tech) {
      if (projectTags.includes(tech as (typeof projectTags)[number])) {
        counts[tech] = (counts[tech] ?? 0) + 1;
      }
    }
  }
  const tags = ["all", ...Object.keys(counts).sort()];

  const visible = active === "all" ? projects : projects.filter((p) => p.tech.includes(active));

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Work, with the hard parts written down"
        lede="Every case study answers the question a client actually asks: what was difficult, and what did you do about it?"
      />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {/* The filter is the only client-side part; the cards below are in the
            static HTML, so crawlers and no-JS visitors see the real content. */}
        <Suspense fallback={<div className="h-8" />}>
          <Reveal>
            <ProjectFilters tags={tags} counts={counts} active={active} total={projects.length} />
          </Reveal>
        </Suspense>

        <p
          className="mono mt-4 text-[10px] uppercase tracking-widest text-[var(--color-ink-3)]"
          aria-live="polite"
        >
          {visible.length} {visible.length === 1 ? "project" : "projects"}
          {active !== "all" && ` tagged ${active}`}
        </p>

        {visible.length === 0 ? (
          <div className="mt-8 border border-dashed border-[var(--color-line)] px-5 py-16 text-center">
            <p className="font-display text-2xl">Nothing here yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-ink-2)]">
              Add a project tagged <span className="mono">{active}</span> in{" "}
              <span className="mono">src/config/portfolio.ts</span>, or pick another filter.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project) => (
              <Reveal key={project.slug}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
