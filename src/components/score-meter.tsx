"use client";

/**
 * ScoreMeter — the explainable score display.
 *
 * Each factor is a separate bar so a visitor can see exactly which part of a
 * motion decision is strong and which is weak, rather than receiving a single
 * opaque number. Selecting a factor expands the measured evidence behind it.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MotionAnalysis, ScoreFactor } from "@/lib/types";
import { BENCH_SPRING } from "@/components/motion-primitives";

const BAND_COPY: Record<MotionAnalysis["band"], { label: string; tone: string }> = {
  stiff: { label: "too fast", tone: "text-cobalt" },
  balanced: { label: "balanced", tone: "ink-signal" },
  soft: { label: "soft", tone: "text-ink-2" },
  sluggish: { label: "sluggish", tone: "text-ruby" },
  bouncy: { label: "over-bouncy", tone: "text-ruby" },
  chaotic: { label: "never settles", tone: "text-ruby" },
};

function barTone(value: number): string {
  if (value >= 75) return "bg-signal-2";
  if (value >= 50) return "bg-cobalt";
  return "bg-ruby";
}

function FactorRow({ factor, expanded, onToggle }: { factor: ScoreFactor; expanded: boolean; onToggle: () => void }) {
  const reduced = useReducedMotion();

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full px-3 py-2.5 text-left transition-colors hover:bg-ink/[0.04]"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-2">{factor.label}</span>
          <span className="mono text-[11px] text-ink-3">
            {factor.value}
            <span className="text-ink-3/60">/100</span>
            <span className="ml-2 text-ink-3">+{factor.contribution}</span>
          </span>
        </div>

        <div className="mt-1.5 h-1 w-full bg-ink/10">
          <motion.div
            className={`h-full ${barTone(factor.value)}`}
            initial={reduced ? false : { width: 0 }}
            animate={{ width: `${factor.value}%` }}
            transition={{ ...BENCH_SPRING, duration: 0.5 }}
          />
        </div>
      </button>

      {expanded && (
        <motion.p
          initial={reduced ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden px-3 pb-2.5 text-xs leading-relaxed text-ink-2"
        >
          {factor.evidence}
        </motion.p>
      )}
    </li>
  );
}

export function ScoreMeter({ analysis, className }: { analysis: MotionAnalysis; className?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const band = BAND_COPY[analysis.band];

  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label">Motion quality</p>
          <p className="mono mt-1 text-4xl font-medium leading-none">
            <motion.span
              key={analysis.score}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={BENCH_SPRING}
            >
              {analysis.score}
            </motion.span>
            <span className="text-lg text-ink-3">/100</span>
          </p>
        </div>
        <p className={`font-mono text-xs uppercase tracking-widest ${band.tone}`}>{band.label}</p>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-px border border-ink/12 bg-ink/12">
        {[
          { label: "settle", value: `${analysis.settleTimeMs}ms` },
          { label: "overshoot", value: `${(analysis.overshoot * 100).toFixed(1)}%` },
          { label: "onset", value: `${analysis.onsetMs}ms` },
        ].map((stat) => (
          <div key={stat.label} className="bg-paper px-2 py-2">
            <dt className="label">{stat.label}</dt>
            <dd className="mono mt-0.5 text-sm">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-3 divide-y divide-ink/8 border border-ink/12">
        {analysis.factors.map((factor) => (
          <FactorRow
            key={factor.id}
            factor={factor}
            expanded={open === factor.id}
            onToggle={() => setOpen((prev) => (prev === factor.id ? null : factor.id))}
          />
        ))}
      </ul>

      <p className="mono mt-2 text-[10px] text-ink-3">
        seal {analysis.seal ? `${analysis.seal.slice(0, 20)}…` : "draft (unsealed)"}
      </p>
    </div>
  );
}
