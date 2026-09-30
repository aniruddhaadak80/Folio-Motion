"use client";

import { motion, useReducedMotion } from "framer-motion";
import { experience, sectionIds, type ExperienceEntry } from "@/config/portfolio";
import { Reveal, SectionHeading } from "@/components/motion-primitives";

/**
 * One timeline row. The rail is a real line with a marker, and the entry
 * expands its highlights on hover and focus, so nothing is hidden behind a
 * click you have to discover.
 */
function TimelineRow({ entry, index }: { entry: ExperienceEntry; index: number }) {
  const reduced = useReducedMotion();
  const isCurrent = entry.status === "current";

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group relative pl-10 sm:pl-14"
    >
      {/* Marker on the rail */}
      <span
        aria-hidden
        className={`absolute left-0 top-1.5 flex h-5 w-5 items-center justify-center sm:left-1 ${
          isCurrent ? "" : "opacity-60 group-hover:opacity-100"
        }`}
      >
        <span
          className={`block h-2.5 w-2.5 rotate-45 border ${
            isCurrent
              ? "border-[var(--color-signal-2)] bg-[var(--color-signal)]"
              : "border-[var(--color-ink-3)] bg-[var(--color-paper)]"
          }`}
        />
      </span>

      <div className="pb-10">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-xl">{entry.role}</h3>
          {isCurrent && <span className="chip chip-live">current</span>}
        </div>

        <p className="mono mt-1 text-[11px] uppercase tracking-widest text-[var(--color-ink-3)]">
          {entry.company}
          {entry.location ? ` · ${entry.location}` : ""} · {entry.period}
        </p>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-2)]">
          {entry.summary}
        </p>

        <ul className="mt-4 space-y-2">
          {entry.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2.5 text-sm text-[var(--color-ink-2)]">
              <span aria-hidden className="mt-[0.45rem] h-1 w-1 shrink-0 bg-[var(--color-signal-2)]" />
              <span className="leading-relaxed">{highlight}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {entry.tech.map((tech) => (
            <li key={tech} className="chip">
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  );
}

/** The experience band, shared by the home page and /experience. */
export function Experience({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section
      id={sectionIds.experience}
      className="border-b border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper-2)_45%,transparent)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        {withHeading && (
          <SectionHeading
            eyebrow="Experience"
            title="Where I've worked"
            lede="Roles, and the thing I'd tell someone considering hiring me about each one."
          />
        )}

        {experience.length === 0 ? (
          <p className="mt-10 border border-dashed border-[var(--color-line)] px-5 py-12 text-center font-mono text-xs uppercase tracking-widest text-[var(--color-ink-3)]">
            No experience entries yet — add them in src/config/portfolio.ts
          </p>
        ) : (
          <div className="relative mt-12">
            {/* The rail itself. */}
            <span
              aria-hidden
              className="absolute left-[0.3rem] top-2 h-[calc(100%-3rem)] w-px bg-[var(--color-line)] sm:left-[1.3rem]"
            />
            <ol className="relative">
              {experience.map((entry, i) => (
                <TimelineRow key={`${entry.company}-${entry.period}`} entry={entry} index={i} />
              ))}
            </ol>
          </div>
        )}

        <Reveal>
          <p className="mono text-[10px] uppercase tracking-widest text-[var(--color-ink-3)]">
            Earlier work and education available on request
          </p>
        </Reveal>
      </div>
    </section>
  );
}
