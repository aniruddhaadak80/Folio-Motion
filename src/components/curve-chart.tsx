"use client";

/**
 * CurveChart — plots the engine's real trace.
 *
 * The path is drawn from the numerical integration, not a decorative squiggle,
 * and it animates by animating stroke-dashoffset so the curve appears to be
 * *measured* left to right. The 60/120fps frame grid makes the settle time
 * directly readable.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export interface CurvePoint {
  t: number;
  value: number;
}

interface Props {
  trace: CurvePoint[];
  settleTimeMs: number;
  height?: number;
  showGrid?: boolean;
  className?: string;
  accent?: string;
}

const W = 640;
const PAD_L = 34;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 22;

export function CurveChart({ trace, settleTimeMs, height = 200, showGrid = true, className, accent = "#c8f542" }: Props) {
  const reduced = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const [drawProgress, setDrawProgress] = useState(0);
  // Derived, not stored: reduced motion simply means "fully drawn".
  const shownProgress = reduced ? 1 : drawProgress;

  const geometry = useMemo(() => {
    if (trace.length === 0) return { path: "", dots: [], plotW: W - PAD_L - PAD_R, plotH: height - PAD_T - PAD_B };

    const settleSec = Math.max(0.05, settleTimeMs / 1000);
    // Show a little past settle so the tail is visible.
    const maxT = Math.max(settleSec * 1.12, trace[trace.length - 1]?.t ?? settleSec);
    const visible = trace.filter((p) => p.t <= maxT);
    const values = visible.map((p) => p.value);
    const minV = Math.min(0, ...values);
    const maxV = Math.max(1, ...values, 1.02);
    const spanV = Math.max(0.05, maxV - minV);
    const plotW = W - PAD_L - PAD_R;
    const plotH = height - PAD_T - PAD_B;

    const pts = visible.map((p) => ({
      x: PAD_L + (p.t / maxT) * plotW,
      y: PAD_T + plotH - ((p.value - minV) / spanV) * plotH,
    }));

    // Only keep points that are on screen to bound path size.
    const step = Math.max(1, Math.floor(pts.length / 400));
    const thinned = pts.filter((_, i) => i % step === 0);
    if (pts.length > 0 && thinned[thinned.length - 1] !== pts[pts.length - 1]) {
      thinned.push(pts[pts.length - 1]!);
    }

    const d = thinned.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

    const settleX = PAD_L + (settleSec / maxT) * plotW;

    return { path: d, settleX, plotW, plotH, maxT, minV, maxV, spanV, last: thinned[thinned.length - 1] };
  }, [trace, settleTimeMs, height]);

  // Animate the draw-on when the trace changes. The reset and the advance both
  // happen inside rAF so no state is set synchronously during the effect.

  const { path, settleX, plotW, plotH, maxT } = geometry as {
    path: string;
    settleX: number;
    plotW: number;
    plotH: number;
    maxT: number;
    minV?: number;
    maxV?: number;
    spanV?: number;
    last?: { x: number; y: number };
  };

  const frameMs = 1000 / 60;
  const frameCount = Math.floor(settleTimeMs / frameMs);

  /**
   * Reset the draw animation when the path changes. Adjusting state during
   * render is the documented React pattern and avoids an extra commit.
   */
  const [drawnPath, setDrawnPath] = useState(geometry.path);
  if (drawnPath !== geometry.path) {
    setDrawnPath(geometry.path);
    if (!reduced) setDrawProgress(0);
  }

  // Advance the playhead in an animation frame, never synchronously in an effect.
  useEffect(() => {
    if (reduced || drawProgress === 1) return;
    const raf = requestAnimationFrame(() => setDrawProgress(1));
    return () => cancelAnimationFrame(raf);
  }, [reduced, drawProgress, geometry.path]);

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Motion curve, settles in ${Math.round(settleTimeMs)} milliseconds`}
        preserveAspectRatio="none"
      >
        {/* Frame grid: one line per 16.67ms at 60fps */}
        {showGrid &&
          Array.from({ length: Math.min(24, Math.max(2, frameCount)) }).map((_, i) => {
            const t = ((i + 1) * frameMs) / 1000;
            if (t > maxT) return null;
            const x = PAD_L + (t / maxT) * plotW;
            return (
              <line
                key={`f${i}`}
                x1={x}
                y1={PAD_T}
                x2={x}
                y2={PAD_T + plotH}
                stroke="#241b2f"
                strokeOpacity={i % 5 === 0 ? 0.16 : 0.07}
                strokeWidth={1}
              />
            );
          })}

        {/* Axes */}
        <line x1={PAD_L} y1={PAD_T + plotH} x2={PAD_L + plotW} y2={PAD_T + plotH} stroke="#241b2f" strokeOpacity={0.35} />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + plotH} stroke="#241b2f" strokeOpacity={0.35} />

        {/* Target line (progress = 1) */}
        {geometry.maxV !== undefined && geometry.minV !== undefined && geometry.spanV !== undefined && (
          <line
            x1={PAD_L}
            y1={PAD_T + plotH - ((1 - geometry.minV) / geometry.spanV) * plotH}
            x2={PAD_L + plotW}
            y2={PAD_T + plotH - ((1 - geometry.minV) / geometry.spanV) * plotH}
            stroke="#241b2f"
            strokeOpacity={0.22}
            strokeDasharray="3 3"
          />
        )}

        {/* Settle marker */}
        <line x1={settleX} y1={PAD_T} x2={settleX} y2={PAD_T + plotH} stroke="#d94f2b" strokeOpacity={0.65} strokeWidth={1.5} />

        {/* The measured curve */}
        <path
          ref={pathRef}
          d={path}
          fill="none"
          stroke="#241b2f"
          strokeWidth={4}
          strokeOpacity={0.12}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path}
          fill="none"
          stroke={accent}
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - shownProgress}
        />

        {/* Head dot */}
        {geometry.last && shownProgress > 0.98 && (
          <circle cx={geometry.last.x} cy={geometry.last.y} r={3.5} fill={accent} stroke="#241b2f" strokeWidth={1.5} />
        )}

        {/* Axis labels */}
        <text x={4} y={PAD_T + 8} fontSize={9} fill="#6b5c7e" fontFamily="var(--font-mono)">
          1.0
        </text>
        <text x={4} y={PAD_T + plotH} fontSize={9} fill="#6b5c7e" fontFamily="var(--font-mono)">
          0.0
        </text>
        <text x={settleX + 4} y={PAD_T + 9} fontSize={9} fill="#d94f2b" fontFamily="var(--font-mono)">
          settle
        </text>
        <text x={PAD_L + plotW - 30} y={height - 5} fontSize={9} fill="#6b5c7e" fontFamily="var(--font-mono)">
          {maxT.toFixed(2)}s
        </text>
      </svg>
    </div>
  );
}
