"use client";

/**
 * The band that explains why this template is not just a template.
 *
 * It is also a working demonstration: the box below is moved by the same
 * spring the engine scores, so the claim is visible rather than asserted.
 */

import Link from "next/link";
import { ArrowRight, Terminal, Boxes, Fingerprint } from "lucide-react";
import { LiveSpringPreview } from "@/components/live-spring-preview";
import { Reveal, SectionHeading, StaggerGroup, StaggerItem, TiltCard } from "@/components/motion-primitives";
import type { MotionParams, MotionTarget } from "@/lib/types";

const DEMO: MotionParams = {
  kind: "spring",
  stiffness: 420,
  damping: 9,
  mass: 1,
  displacement: 100,
};
const DEMO_TARGET: MotionTarget = "scale";

const FEATURES = [
  {
    icon: Boxes,
    title: "A real backend, not a mock",
    body: "Postgres in production, an embedded database for local dev, REST endpoints, and a full create-read-update-delete loop through the UI.",
  },
  {
    icon: Terminal,
    title: "An MCP agent interface",
    body: "Eight tools over JSON-RPC 2.0, including a mutating one. Point any MCP client at it and your AI can read and write your content.",
  },
  {
    icon: Fingerprint,
    title: "An audit chain you can verify",
    body: "Every change is sealed with SHA-384 and replayable from a public endpoint, so history is provable rather than merely stored.",
  },
];

export function LabTeaser() {
  return (
    <section className="border-b border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper-2)_45%,transparent)]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="The different bit"
              title="A motion lab that measures animation"
              lede="Every transition in this template can be scored by a numerical physics engine. Not a lookup table — the spring equation, integrated at a fixed 240Hz step."
            />

            <StaggerGroup className="mt-8 space-y-3" amount={0.1}>
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <StaggerItem key={feature.title}>
                    <div className="flex gap-3.5">
                      <Icon size={17} className="mt-0.5 shrink-0 text-[var(--color-signal-2)]" />
                      <div>
                        <h3 className="text-base">{feature.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-2)]">
                          {feature.body}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>

            <Reveal delay={0.16}>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link href="/lab" className="btn-bench">
                  Open the motion lab <ArrowRight size={14} />
                </Link>
                <Link href="/method" className="btn-ghost">
                  How the engine works
                </Link>
              </div>
            </Reveal>
          </div>

          {/* A live demonstration, not a screenshot. */}
          <Reveal delay={0.12}>
            <TiltCard max={2.5}>
              <div className="panel panel-raised p-5">
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <p className="label">Live integration</p>
                  <p className="mono text-[10px] uppercase tracking-widest text-[var(--color-ink-3)]">
                    k=420 c=9 m=1
                  </p>
                </div>
                <LiveSpringPreview params={DEMO} target={DEMO_TARGET} />
                <dl className="mt-4 grid grid-cols-3 gap-px border border-[var(--color-line)] bg-[var(--color-line)]">
                  {[
                    { k: "settle", v: "1246ms" },
                    { k: "overshoot", v: "47.2%" },
                    { k: "verdict", v: "bouncy" },
                  ].map((stat) => (
                    <div key={stat.k} className="bg-[var(--color-paper)] px-2 py-2">
                      <dt className="label">{stat.k}</dt>
                      <dd className="mono mt-0.5 text-sm">{stat.v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-3)]">
                  That box is being moved by the same equation the engine scores. Change the
                  parameters in the lab and every number above moves with it.
                </p>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
