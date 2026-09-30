"use client";

/**
 * Lab — the primary workspace.
 *
 * Adjusting a dial re-scores the motion immediately against the stateless
 * `/api/analyze` endpoint (no database write on every drag), and saving
 * persists a real spec through `POST /api/specs`. Every control here maps to
 * a genuine request; there are no simulated latencies.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LiveSpringPreview } from "@/components/live-spring-preview";
import { CurveChart } from "@/components/curve-chart";
import { ScoreMeter } from "@/components/score-meter";
import { Magnetic, BENCH_SPRING } from "@/components/motion-primitives";
import type { MotionAnalysis, MotionParams, MotionSpec, MotionTarget } from "@/lib/types";

const TARGETS: Array<{ value: MotionTarget; label: string; hint: string }> = [
  { value: "translate", label: "translate", hint: "transform — compositor friendly" },
  { value: "scale", label: "scale", hint: "transform — compositor friendly" },
  { value: "rotate", label: "rotate", hint: "transform — compositor friendly" },
  { value: "opacity", label: "opacity", hint: "compositor friendly" },
  { value: "blur", label: "blur", hint: "forces paint every frame" },
];

const PRESETS: Array<{ name: string; target: MotionTarget; params: MotionParams }> = [
  {
    name: "Modal enter",
    target: "translate",
    params: { kind: "spring", stiffness: 320, damping: 30, mass: 1, displacement: 100 },
  },
  {
    name: "Snappy chip",
    target: "scale",
    params: { kind: "spring", stiffness: 620, damping: 26, mass: 0.7, displacement: 100 },
  },
  {
    name: "Loose drawer",
    target: "translate",
    params: { kind: "spring", stiffness: 180, damping: 24, mass: 1.2, displacement: 100 },
  },
  {
    name: "Rubber band",
    target: "scale",
    params: { kind: "spring", stiffness: 420, damping: 9, mass: 1, displacement: 100 },
  },
  {
    name: "Material standard",
    target: "translate",
    params: { kind: "bezier", x1: 0.4, y1: 0, x2: 0.2, y2: 1, durationMs: 300 },
  },
  {
    name: "Emphasized decel",
    target: "translate",
    params: { kind: "bezier", x1: 0.05, y1: 0.7, x2: 0.1, y2: 1, durationMs: 420 },
  },
  {
    name: "Anticipate",
    target: "translate",
    params: { kind: "bezier", x1: 0.68, y1: -0.6, x2: 0.32, y2: 1, durationMs: 480 },
  },
];

type Status =
  | { kind: "idle" }
  | { kind: "analyzing" }
  | { kind: "saving" }
  | { kind: "saved"; id: string }
  | { kind: "error"; message: string };

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
  decimals = 0,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
  decimals?: number;
}) {
  const id = `dial-${label.replace(/\s+/g, "-")}`;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="label">
          {label}
        </label>
        <output htmlFor={id} className="mono text-xs text-ink-2">
          {value.toFixed(decimals)}
          {suffix}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="dial"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Lab() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [kind, setKind] = useState<"spring" | "bezier">("spring");
  const [target, setTarget] = useState<MotionTarget>("translate");
  const [spring, setSpring] = useState({ stiffness: 320, damping: 30, mass: 1, displacement: 100 });
  const [bezier, setBezier] = useState({ x1: 0.4, y1: 0, x2: 0.2, y2: 1, durationMs: 300 });
  const [name, setName] = useState("Modal enter");
  const [analysis, setAnalysis] = useState<MotionAnalysis | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [playToken, setPlayToken] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idempotencyRef = useRef<string>("");

  const params: MotionParams = useMemo(
    () => (kind === "spring" ? { kind: "spring", ...spring } : { kind: "bezier", ...bezier }),
    [kind, spring, bezier],
  );

  /* Score the draft whenever the parameters change (debounced). */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // Status is set here rather than synchronously in the effect body so no
      // state update happens during the effect's own render pass.
      setStatus((prev) => (prev.kind === "saving" ? prev : { kind: "analyzing" }));
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params, target }),
        });
        const json = (await res.json()) as MotionAnalysis & { error?: { message: string } };
        if (!res.ok) {
          setStatus({ kind: "error", message: json.error?.message ?? `Analysis failed (${res.status})` });
          return;
        }
        setAnalysis(json);
        setStatus({ kind: "idle" });
      } catch {
        setStatus({ kind: "error", message: "Could not reach the analysis endpoint." });
      }
    }, 90);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [params, target]);

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setName(preset.name);
    setTarget(preset.target);
    setPlayToken((t) => t + 1);
    if (preset.params.kind === "spring") {
      setKind("spring");
      const p = preset.params;
      setSpring({
        stiffness: p.stiffness,
        damping: p.damping,
        mass: p.mass,
        displacement: p.displacement,
      });
    } else {
      setKind("bezier");
      const p = preset.params;
      setBezier({ x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2, durationMs: p.durationMs });
    }
  }, []);

  const save = useCallback(async () => {
    if (!name.trim()) {
      setStatus({ kind: "error", message: "Give the spec a name before saving." });
      return;
    }
    setStatus({ kind: "saving" });
    // A stable idempotency key per attempt makes a double-click safe.
    if (!idempotencyRef.current) {
      idempotencyRef.current = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    }
    try {
      const res = await fetch("/api/specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), target, params, idempotencyKey: idempotencyRef.current }),
      });
      const json = (await res.json()) as MotionSpec & { error?: { message: string } };
      if (!res.ok) {
        setStatus({ kind: "error", message: json.error?.message ?? `Save failed (${res.status})` });
        return;
      }
      idempotencyRef.current = "";
      setStatus({ kind: "saved", id: json.id });
    } catch {
      setStatus({ kind: "error", message: "Could not reach the save endpoint." });
    }
  }, [name, target, params]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="label">The bench</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Motion lab</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
          Move a dial and the score recomputes from a live numerical integration of the spring
          equation. Nothing here is a guess or a lookup table.
        </p>
      </header>

      {/* Presets */}
      <section aria-label="Presets" className="mb-8">
        <p className="label mb-2">Start from a preset</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="chip transition-colors hover:border-ink hover:bg-ink hover:text-paper focus-visible:border-ink"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* Controls */}
        <section className="panel panel-raised p-5" aria-label="Motion parameters">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg">Parameters</h2>
            <div
              className="flex border border-ink/20"
              role="group"
              aria-label="Motion model"
            >
              {(["spring", "bezier"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  aria-pressed={kind === k}
                  className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                    kind === k ? "bg-ink text-paper" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {kind === "spring" ? (
              <>
                <Slider
                  label="stiffness"
                  value={spring.stiffness}
                  min={20}
                  max={900}
                  step={5}
                  onChange={(v) => setSpring((s) => ({ ...s, stiffness: v }))}
                />
                <Slider
                  label="damping"
                  value={spring.damping}
                  min={0}
                  max={90}
                  step={1}
                  onChange={(v) => setSpring((s) => ({ ...s, damping: v }))}
                />
                <Slider
                  label="mass"
                  value={spring.mass}
                  min={0.2}
                  max={6}
                  step={0.1}
                  decimals={1}
                  onChange={(v) => setSpring((s) => ({ ...s, mass: v }))}
                />
                <Slider
                  label="displacement"
                  value={spring.displacement}
                  min={20}
                  max={400}
                  step={5}
                  suffix="px"
                  onChange={(v) => setSpring((s) => ({ ...s, displacement: v }))}
                />
                <p className="border-l-2 border-signal-2 pl-3 text-xs leading-relaxed text-ink-2">
                  Damping ratio ζ = {(
                    spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass))
                  ).toFixed(2)}
                  {spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass)) < 1
                    ? " — under-damped, it will overshoot."
                    : " — over-damped, it will crawl in without bouncing."}
                </p>
              </>
            ) : (
              <>
                <Slider
                  label="x1"
                  value={bezier.x1}
                  min={0}
                  max={1}
                  step={0.01}
                  decimals={2}
                  onChange={(v) => setBezier((b) => ({ ...b, x1: v }))}
                />
                <Slider
                  label="y1"
                  value={bezier.y1}
                  min={-1}
                  max={2}
                  step={0.01}
                  decimals={2}
                  onChange={(v) => setBezier((b) => ({ ...b, y1: v }))}
                />
                <Slider
                  label="x2"
                  value={bezier.x2}
                  min={0}
                  max={1}
                  step={0.01}
                  decimals={2}
                  onChange={(v) => setBezier((b) => ({ ...b, x2: v }))}
                />
                <Slider
                  label="y2"
                  value={bezier.y2}
                  min={-1}
                  max={2}
                  step={0.01}
                  decimals={2}
                  onChange={(v) => setBezier((b) => ({ ...b, y2: v }))}
                />
                <Slider
                  label="duration"
                  value={bezier.durationMs}
                  min={60}
                  max={1200}
                  step={10}
                  suffix="ms"
                  onChange={(v) => setBezier((b) => ({ ...b, durationMs: v }))}
                />
              </>
            )}
          </div>

          <div className="mt-6">
            <p className="label mb-2">Animated property</p>
            <div className="flex flex-wrap gap-1.5">
              {TARGETS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTarget(t.value)}
                  aria-pressed={target === t.value}
                  title={t.hint}
                  className={`chip transition-colors ${
                    target === t.value ? "border-ink bg-ink text-paper" : "hover:border-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Readouts */}
        <div className="space-y-6">
          <section className="panel p-5" aria-label="Live preview">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg">Live preview</h2>
              <span className="label">integrated at 240Hz</span>
            </div>
            <LiveSpringPreview key={playToken} params={params} target={target} />
          </section>

          <section className="panel p-5" aria-label="Measured curve">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg">Measured curve</h2>
              <span className="label">progress vs time</span>
            </div>
            {analysis ? (
              <CurveChart trace={analysis.trace} settleTimeMs={analysis.settleTimeMs} />
            ) : (
              <div className="flex h-[200px] items-center justify-center border border-dashed border-ink/20">
                <p className="mono text-[11px] uppercase tracking-widest text-ink-3">
                  {status.kind === "analyzing" ? "integrating…" : "no measurement yet"}
                </p>
              </div>
            )}
          </section>

          <section className="panel p-5" aria-label="Score breakdown">
            {analysis ? (
              <ScoreMeter analysis={analysis} />
            ) : (
              <p className="mono text-[11px] uppercase tracking-widest text-ink-3">scoring…</p>
            )}
          </section>
        </div>
      </div>

      {/* Save */}
      <section className="panel panel-raised mt-6 p-5" aria-label="Save this spec">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label htmlFor="spec-name" className="label">
              Spec name
            </label>
            <input
              id="spec-name"
              className="field mt-1.5"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Modal enter"
            />
          </div>
          <Magnetic className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlayToken((t) => t + 1)}
              className="btn-ghost"
              disabled={status.kind === "saving"}
            >
              Replay
            </button>
            <button
              type="button"
              onClick={save}
              className="btn-bench"
              disabled={status.kind === "saving"}
            >
              {status.kind === "saving" ? "Saving…" : "Save spec"}
            </button>
          </Magnetic>
        </div>

        <div className="mt-3 min-h-[1.25rem]" aria-live="polite">
          {status.kind === "error" && (
            <motion.p
              initial={reduced ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xs text-ruby"
            >
              {status.message}
            </motion.p>
          )}
          {status.kind === "saved" && (
            <motion.p
              initial={reduced ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={BENCH_SPRING}
              className="font-mono text-xs text-ink-2"
            >
              Saved.{" "}
              <Link href={`/specs/${status.id}`} className="underline decoration-signal-2 underline-offset-4 hover:text-ink">
                open the spec →
              </Link>
            </motion.p>
          )}
          {status.kind === "idle" && analysis && (
            <p className="mono text-[11px] uppercase tracking-widest text-ink-3">
              draft · not yet persisted
            </p>
          )}
        </div>

        {status.kind === "saved" && (
          <div className="mt-3 flex gap-2">
            <Link href={`/specs/${status.id}`} className="btn-ghost">
              Inspect spec
            </Link>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setStatus({ kind: "idle" });
                router.push("/specs");
              }}
            >
              Go to library
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
