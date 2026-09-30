"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { highlights, personal, sectionIds, services, skillGroups } from "@/config/portfolio";
import { Reveal, SectionHeading, StaggerGroup, StaggerItem, TiltCard } from "@/components/motion-primitives";

/** The "what I do" band. Four cards, each tied to real skills. */
export function Services() {
  return (
    <section id={sectionIds.services} className="border-b border-[var(--color-line)]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="What I do"
          title="The work, in four shapes"
          lede="Most projects land in one of these. Each one is a different reason to hire me, and each one comes with the unglamorous parts included."
        />

        <StaggerGroup className="mt-10 grid gap-3 sm:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <StaggerItem key={service.title}>
                <TiltCard max={3} className="h-full">
                  <article className="panel panel-raised group relative h-full overflow-hidden p-6">
                    <div
                      aria-hidden
                      className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 bg-[var(--color-signal)] opacity-0 transition-opacity duration-500 group-hover:opacity-20"
                    />
                    <Icon size={22} className="text-[var(--color-signal-2)]" aria-hidden />
                    <h3 className="mt-4 text-xl">{service.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-ink-2)]">
                      {service.description}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {service.skills.map((skill) => (
                        <li key={skill} className="chip">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </article>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}

/** The short "about" band on the home page, with the portrait and highlights. */
export function About() {
  return (
    <section id={sectionIds.about} className="border-b border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper-2)_45%,transparent)]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <div className="relative">
              <div className="relative aspect-[5/6] overflow-hidden border border-[var(--color-line)]">
                <Image
                  src={personal.portrait}
                  alt={`${personal.name} — portrait`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 420px"
                  className="object-cover"
                />
              </div>
              <div
                aria-hidden
                className="absolute -bottom-3 -right-3 -z-10 h-full w-full border border-[var(--color-signal-2)]"
              />
            </div>
          </Reveal>

          <div>
            <SectionHeading eyebrow="About" title="A bit about me" />

            <Reveal delay={0.1}>
              <p className="mt-6 text-pretty text-base leading-relaxed text-[var(--color-ink-2)]">
                {personal.shortBio}
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-4 text-pretty text-sm leading-relaxed text-[var(--color-ink-2)]">
                {personal.longBio[0]}
              </p>
            </Reveal>

            {/* A small fact table, which people actually read. */}
            <Reveal delay={0.22}>
              <dl className="mt-8 divide-y divide-[var(--color-line-soft)] border-y border-[var(--color-line-soft)]">
                {highlights.map((item) => (
                  <div key={item.label} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
                    <dt className="label pt-0.5">{item.label}</dt>
                    <dd className="text-sm text-[var(--color-ink)]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.28}>
              <Link href="/about" className="btn-bench mt-8">
                More about me <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Skills with honest levels. */
export function Skills() {
  return (
    <section id={sectionIds.skills} className="border-b border-[var(--color-line)]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Skills"
          title="What I reach for"
          lede="Levels are honest. A 75 means I have shipped with it and can debug it, not that I could answer a quiz about it."
        />

        <StaggerGroup className="mt-10 grid gap-3 md:grid-cols-2">
          {skillGroups.map((group) => {
            const Icon = group.icon;
            return (
              <StaggerItem key={group.title}>
                <div className="panel h-full p-6">
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} className="text-[var(--color-signal-2)]" />
                    <h3 className="text-lg">{group.title}</h3>
                  </div>

                  <ul className="mt-5 space-y-3.5">
                    {group.skills.map((skill) => (
                      <li key={skill.name}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm text-[var(--color-ink)]">
                            {skill.name}
                            {skill.note && (
                              <span className="ml-2 font-mono text-[10px] text-[var(--color-ink-3)]">
                                {skill.note}
                              </span>
                            )}
                          </span>
                          <span className="mono text-[11px] text-[var(--color-ink-3)]">
                            {skill.level}
                          </span>
                        </div>
                        <div
                          className="mt-1.5 h-[3px] w-full bg-[var(--color-line-soft)]"
                          role="img"
                          aria-label={`${skill.name}: ${skill.level} out of 100`}
                        >
                          <div
                            className="h-full bg-[var(--color-signal-2)]"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
