"use client";

/**
 * Projects index with working filters.
 *
 * The active tag lives in the URL, so a filtered view can be shared and
 * survives a refresh.
 */

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowUpRight, ExternalLink, Github, Star } from "lucide-react";
import Link from "next/link";
import { projects, projectTags } from "@/config/portfolio";
import { Reveal, StaggerGroup, StaggerItem, TiltCard } from "@/components/motion-primitives";

export function ProjectsIndex() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("tag") ?? "all";

  const tags = useMemo(() => {
    const seen = new Set<string>();
    for (const project of projects) {
      for (const tech of project.tech) {
        if (projectTags.includes(tech as (typeof projectTags)[number])) seen.add(tech);
      }
    }
    return ["all", ...Array.from(seen)];
  }, []);

  const visible =
    active === "all" ? projects : projects.filter((p) => p.tech.includes(active));

  const setTag = (tag: string) => {
    const next = new URLSearchParams(params.toString());
    if (tag === "all") next.delete("tag");
    else next.set("tag", tag);
    const qs = next.toString();
    router.replace(qs ? `/projects?${qs}` : "/projects", { scroll: false });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      {/* Filters */}
      <Reveal>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by technology">
          {tags.map((tag) => {
            const isActive = active === tag;
            const count =
              tag === "all" ? projects.length : projects.filter((p) => p.tech.includes(tag)).length;
            if (count === 0) return null;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setTag(tag)}
                aria-pressed={isActive}
                className={`chip transition-colors ${
                  isActive
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
                    : "hover:border-[var(--color-ink)]"
                }`}
              >
                {tag}
                <span className={isActive ? "opacity-60" : "text-[var(--color-ink-3)]"}>{count}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <p className="mono mt-4 text-[10px] uppercase tracking-widest text-[var(--color-ink-3)]" aria-live="polite">
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
        <StaggerGroup className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" amount={0.04}>
          {visible.map((project) => (
            <StaggerItem key={project.slug}>
              <TiltCard max={2.5} className="h-full">
                <article className="panel group flex h-full flex-col overflow-hidden transition-colors hover:border-[var(--color-ink)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-paper-2)]">
                    <Image
                      src={project.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      {project.status && <span className="chip">{project.status}</span>}
                      {project.featured && (
                        <span className="chip chip-live">
                          <Star size={9} /> featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="text-lg leading-tight">{project.title}</h2>
                      <span className="mono shrink-0 text-[10px] text-[var(--color-ink-3)]">
                        {project.year}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
                      {project.summary}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {project.tech.slice(0, 3).map((tech) => (
                        <li key={tech} className="chip">
                          {tech}
                        </li>
                      ))}
                      {project.tech.length > 3 && <li className="chip">+{project.tech.length - 3}</li>}
                    </ul>

                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      <Link href={`/projects/${project.slug}`} className="btn-ghost btn-sm">
                        Case study <ArrowUpRight size={12} />
                      </Link>
                      {project.links?.live && (
                        <a
                          href={project.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost btn-sm"
                          aria-label={`Open ${project.title} live (opens in a new tab)`}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                      {project.links?.repo && (
                        <a
                          href={project.links.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost btn-sm"
                          aria-label={`View ${project.title} on GitHub (opens in a new tab)`}
                        >
                          <Github size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
