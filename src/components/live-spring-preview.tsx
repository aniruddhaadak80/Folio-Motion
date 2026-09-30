"use client";

/**
 * LiveSpringPreview — the signature interaction.
 *
 * Rather than hand a spring config to a library and hope, this component
 * integrates the same ODE the server engine uses, in a requestAnimationFrame
 * loop, and moves a real element with the result. The box you see bouncing is
 * the actual solution of
 *
 *     x'' = (-k·x - c·v) / m
 *
 * which is why the preview, the score, and the exported CSS always agree.
 *
 * The parent remounts this component with `key` to replay it, which is the
 * idiomatic way to reset animation state without an effect.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { MotionParams, MotionTarget } from "@/lib/types";

const DT = 1 / 240;
const DURATION_S = 4;

interface Sample {
  x: number;
  t: number;
}

function bezierAt(params: Extract<MotionParams, { kind: "bezier" }>, t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const cx = 3 * params.x1;
  const bx = 3 * (params.x2 - params.x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * params.y1;
  const by = 3 * (params.y2 - params.y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleDX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = sampleX(u) - t;
    if (Math.abs(x) < 1e-7) return sampleY(u);
    const d = sampleDX(u);
    if (Math.abs(d) < 1e-7) break;
    u -= x / d;
  }

  let lo = 0;
  let hi = 1;
  u = t;
  while (hi - lo > 1e-7) {
    const x = sampleX(u);
    if (Math.abs(x - t) < 1e-7) break;
    if (x < t) lo = u;
    else hi = u;
    u = (hi + lo) / 2;
  }
  return sampleY(u);
}

/** Pure trajectory computation, memoised so it is never recomputed per frame. */
function useTrajectory(params: MotionParams): Sample[] {
  return useMemo(() => {
    if (params.kind === "spring") {
      const k = Math.max(1, params.stiffness);
      const c = Math.max(0, params.damping);
      const m = Math.max(0.1, params.mass);
      const steps = Math.ceil(DURATION_S / DT);
      const out: Sample[] = new Array(steps + 1);
      let x = 0;
      let v = 0;
      for (let i = 0; i <= steps; i++) {
        out[i] = { x, t: i * DT };
        const accel = (-k * x - c * v) / m;
        const nextV = v + accel * DT;
        x += nextV * DT;
        v = nextV;
      }
      return out;
    }

    const duration = Math.max(0.016, params.durationMs / 1000);
    return Array.from({ length: 241 }, (_, i) => ({
      x: bezierAt(params, i / 240),
      t: (i / 240) * duration,
    }));
  }, [params]);
}

/** Look up the normalized position at time t by binary search over the trace. */
function sampleAt(trajectory: Sample[], t: number): number {
  if (trajectory.length === 0) return 0;
  if (t <= 0) return trajectory[0]!.x;
  const last = trajectory[trajectory.length - 1]!;
  if (t >= last.t) return last.x;
  let lo = 0;
  let hi = trajectory.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (trajectory[mid]!.t < t) lo = mid;
    else hi = mid;
  }
  const a = trajectory[lo]!;
  const b = trajectory[hi]!;
  const span = b.t - a.t;
  const f = span > 0 ? (t - a.t) / span : 0;
  return a.x + (b.x - a.x) * f;
}

export function LiveSpringPreview({ params, target }: { params: MotionParams; target: MotionTarget }) {
  const reduced = useReducedMotion();
  const trajectory = useTrajectory(params);
  // Reduced motion renders the finished frame without ever animating.
  const [offset, setOffset] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const rafRef = useRef<number | null>(null);

  // Derived rather than stored, so the effect can depend on a plain boolean
  // and the loop stops itself the moment the playhead reaches the end.
  const finished = offset >= DURATION_S;
  const active = playing && !finished;

  // Drive the playhead from rAF. Synchronizing with the display clock is
  // exactly what an effect is for; the only state update lands in the callback.
  useEffect(() => {
    if (!active) return;
    let last = performance.now();
    const step = (now: number) => {
      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      setOffset((prev) => Math.min(DURATION_S, prev + delta));
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  const play = useCallback(() => {
    setOffset(0);
    setPlaying(true);
  }, []);

  const elapsed = reduced ? DURATION_S : offset;
  const normalized = sampleAt(trajectory, elapsed);

  const travel = 120;
  const dx = -travel + normalized * travel;

  const style: React.CSSProperties =
    target === "opacity"
      ? { opacity: 0.15 + Math.min(1, Math.max(0, normalized)) * 0.85 }
      : target === "scale"
        ? { transform: `scale(${0.4 + Math.min(1.6, Math.max(0, normalized)) * 0.6})` }
        : target === "rotate"
          ? { transform: `rotate(${normalized * 180}deg)` }
          : target === "blur"
            ? { filter: `blur(${Math.max(0, (1 - normalized) * 10)}px)` }
            : { transform: `translate3d(${dx}px, 0, 0)` };

  const glyph =
    target === "opacity" ? "α" : target === "scale" ? "S" : target === "rotate" ? "R" : target === "blur" ? "B" : "T";

  return (
    <div>
      <div className="relative h-32 overflow-hidden border border-ink/15 bg-paper/40">
        <div className="absolute inset-x-0 top-1/2 h-px bg-ink/20" />
        <div className="absolute left-3 top-1/2 h-3 w-px -translate-y-1/2 bg-ink/30" />
        <div className="absolute right-3 top-1/2 h-3 w-px -translate-y-1/2 bg-ink/30" />

        <div
          className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-ink bg-signal font-mono text-[10px] text-ink"
          style={style}
        >
          {glyph}
        </div>

        <button
          type="button"
          onClick={play}
          className="absolute bottom-2 right-2 rounded-sm border border-ink/25 bg-paper/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink transition-colors hover:border-ink hover:bg-signal focus-visible:border-ink"
          aria-label="Replay the motion preview"
        >
          {playing ? "playing" : "replay"}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ink-3">
        <span>t {elapsed.toFixed(3)}s</span>
        <span>
          x {normalized >= 0 ? "+" : ""}
          {normalized.toFixed(3)}
        </span>
        <span>{params.kind}</span>
      </div>
    </div>
  );
}
