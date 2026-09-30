"use client";

/**
 * Project card, shared by the home page, the projects index and the
 * "more projects" strip on a case study. Keeping it in one place is what
 * stops the three from drifting apart.
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, Github, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/config/portfolio";

const STATUS_TONE: Record<string, string> = {
  live: "chip-live",
  building: "chip",
  archived: "chip",
};

export function ProjectCard({
  project,
  size = "md",
  showSummary = true,
}: {
  project: Project;
  size?: "md" | "lg";
  showSummary?: boolean;
}) {
  const reduced = useReducedMotion();
  const wide = size === "lg";

  return (
    <article
      className={`panel group relative flex h-full flex-col overflow-hidden transition-colors hover:border-[var(--color-ink)] ${
        wide ? "lg:col-span-2" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-[var(--color-paper-2)] ${
          wide ? "aspect-[16/7]" : "aspect-[16/10]"
        }`}
      >
        <motion.div
          className="h-full w-full"
          initial={false}
          whileHover={reduced ? undefined : { scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={project.image}
            alt=""
            fill
            sizes={wide ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 768px) 100vw, 40vw"}
            className="object-cover"
          />
        </motion.div>

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {project.status && (
            <span className={`chip ${STATUS_TONE[project.status] ?? "chip"}`}>{project.status}</span>
          )}
          {project.featured && (
            <span className="chip">
              <Star size={9} /> featured
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className={`${wide ? "text-2xl" : "text-lg"} leading-tight`}>{project.title}</h3>
          <span className="mono shrink-0 text-[10px] text-[var(--color-ink-3)]">{project.year}</span>
        </div>

        {showSummary && (
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">{project.summary}</p>
        )}

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.slice(0, wide ? 6 : 4).map((tech) => (
            <li key={tech} className="chip">
              {tech}
            </li>
          ))}
          {project.tech.length > (wide ? 6 : 4) && (
            <li className="chip">+{project.tech.length - (wide ? 6 : 4)}</li>
          )}
        </ul>

        {/* mt-auto keeps the buttons aligned across a row of cards. */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <Link href={`/projects/${project.slug}`} className="btn-ghost btn-sm">
            Case study
            <ArrowRight size={12} />
          </Link>
          {project.links?.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-sm"
              aria-label={`Open the live ${project.title} site (opens in a new tab)`}
            >
              <ExternalLink size={12} />
              Live
            </a>
          )}
          {project.links?.repo && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-sm"
              aria-label={`View the ${project.title} source on GitHub (opens in a new tab)`}
            >
              <Github size={12} />
              Code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
