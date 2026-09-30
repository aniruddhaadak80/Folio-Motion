"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Twitter, Mail, MapPin, Download } from "lucide-react";
import { heroActions, heroStats, personal, socials } from "@/config/portfolio";
import {
  CountUp,
  Magnetic,
  Reveal,
  SplitText,
  Typewriter,
} from "@/components/motion-primitives";
import { GitHubMark } from "@/components/github-mark";

const ICONS: Record<string, typeof Github> = {
  GitHub: Github,
  LinkedIn: Linkedin,
  X: Twitter,
  DEV: Github,
  Email: Mail,
};

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-line)]">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ---------------------------------------------------------- text */}
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                {personal.availableForWork && (
                  <span className="chip chip-live">
                    <span className="relative inline-flex h-1.5 w-1.5">
                      <span
                        aria-hidden
                        className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-signal-2)]"
                        style={
                          reduced ? undefined : { animation: "fm-pulse-ring 2.2s ease-out infinite" }
                        }
                      />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-signal-2)]" />
                    </span>
                    {personal.availableForWorkText}
                  </span>
                )}
                <span className="chip">
                  <MapPin size={10} /> {personal.location}
                </span>
              </div>
            </Reveal>

            <h1 className="mt-6 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl">
              <SplitText text={`Hi, I'm`} as="span" />
              <br />
              <span className="inline-flex flex-wrap items-baseline gap-x-3">
                <SplitText text={personal.name} delay={0.08} as="span" />
              </span>
            </h1>

            {/* Rotating role, like the original template but readable and
                screen-reader friendly. */}
            <p className="mt-5 font-mono text-sm sm:text-base">
              <span className="text-[var(--color-ink-3)]">&gt; </span>
              <Typewriter words={personal.rotatingRoles} className="text-[var(--color-ink)]" />
            </p>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-ink-2)]">
                {personal.tagline}
              </p>
            </Reveal>

            {/* Actions */}
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {heroActions.map((action) =>
                  action.primary ? (
                    <Magnetic key={action.href}>
                      <Link href={action.href} className="btn-bench">
                        {action.label}
                        <ArrowRight size={14} />
                      </Link>
                    </Magnetic>
                  ) : (
                    <Link key={action.href} href={action.href} className="btn-ghost">
                      {action.label}
                    </Link>
                  ),
                )}
                {personal.resume && (
                  <a href={personal.resume} className="btn-ghost" download>
                    <Download size={14} /> Résumé
                  </a>
                )}
              </div>
            </Reveal>

            {/* Socials */}
            <Reveal delay={0.3}>
              <ul className="mt-7 flex flex-wrap items-center gap-2">
                {socials.map((social) => {
                  const Icon = ICONS[social.label];
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        {...(social.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="flex h-9 w-9 items-center justify-center border border-[var(--color-line)] text-[var(--color-ink-2)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
                        aria-label={social.label}
                      >
                        {social.label === "GitHub" ? (
                          <GitHubMark size={15} />
                        ) : Icon ? (
                          <Icon size={15} />
                        ) : (
                          social.label
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>

          {/* --------------------------------------------------------- photo */}
          <Reveal delay={0.12} y={34} className="relative">
            <div className="relative mx-auto w-full max-w-sm">
              {/* Offset frame: a second border behind the photo, like a print
                  registration mark. */}
              <div
                aria-hidden
                className="absolute -inset-3 border border-[var(--color-line)]"
              />
              <div
                aria-hidden
                className="absolute -right-3 -top-3 h-full w-full border border-[var(--color-signal-2)]"
              />

              <div className="relative aspect-[4/5] overflow-hidden border border-[var(--color-line)] bg-[var(--color-paper-2)]">
                <Image
                  src={personal.avatar}
                  alt={`${personal.name}, ${personal.role}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 380px"
                  className="object-cover"
                />
                <div className="filmstrip absolute inset-x-0 top-0 h-1.5 opacity-50" aria-hidden />
                <div className="filmstrip absolute inset-x-0 bottom-0 h-1.5 opacity-50" aria-hidden />
              </div>

              {/* A caption, so the photo is labelled rather than decorative. */}
              <div className="relative mt-3 flex items-baseline justify-between gap-2">
                <p className="mono text-[10px] uppercase tracking-widest text-[var(--color-ink-3)]">
                  {personal.name}
                </p>
                <p className="mono text-[10px] uppercase tracking-widest text-[var(--color-ink-3)]">
                  {personal.timezone}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ------------------------------------------------------------ stats */}
        <dl className="mt-16 grid grid-cols-2 gap-px border border-[var(--color-line)] bg-[var(--color-line)] sm:mt-20 lg:grid-cols-4">
          {heroStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ ...(reduced ? {} : { duration: 0.5, delay: i * 0.06 }), ease: [0.16, 1, 0.3, 1] }}
              className="bg-[var(--color-paper)] px-4 py-5"
              title={stat.hint}
            >
              <dt className="label">{stat.label}</dt>
              <dd className="mono mt-1.5 text-3xl leading-none sm:text-4xl">
                <CountUp to={stat.value} suffix={stat.suffix} />
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>

      {/* Scroll hint */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 lg:block"
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, 12, 0] }}
          transition={reduced ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-ink-3)]">scroll</span>
          <span className="h-6 w-px bg-[var(--color-line)]" />
        </motion.div>
      </div>
    </section>
  );
}
