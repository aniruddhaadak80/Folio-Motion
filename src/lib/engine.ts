/**
 * Deterministic motion-physics engine.
 *
 * Everything here is pure and side-effect free so the identical function can
 * be used by the UI, the REST endpoint, the MCP tool, and the unit tests.
 *
 * Physics:
 *  - A spring is integrated with a fixed-step semi-implicit Euler solver of
 *      x'' = (-k * x - c * v) / m
 *    starting from rest at x0 = -displacement, v0 = 0. Fixed-step (not
 *    variable-step) integration is what makes the result deterministic and
 *    reproducible across machines.
 *  - A cubic bezier is solved by Newton-Raphson with a bisection fallback,
 *    then sampled. This is the same approach browsers use for
 *    `cubic-bezier()` timing functions.
 *
 * Scoring philosophy (documented on /method):
 *  Every factor is a 0..100 "goodness" value derived from a measurable
 *  quantity, multiplied by a weight to give a signed contribution. The final
 *  score is the clamped sum. Nothing is random or hand-tuned per spec.
 */

import type {
  BezierParams,
  MotionAnalysis,
  MotionParams,
  MotionTarget,
  ScoreFactor,
  SpringParams,
} from "./types";

export const ENGINE_VERSION = "2026.2.0";

/** Fixed integration timestep in seconds. 240Hz is well above frame rate. */
const DT = 1 / 240;

/** Integration cap. Anything settling slower than this is treated as no-settle. */
const MAX_SECONDS = 6;

/** Positions are considered "at rest" when within this fraction of the target. */
const REST_THRESHOLD = 0.005;

export const FACTOR_WEIGHTS = {
  settle: 30,
  overshoot: 25,
  onset: 20,
  smoothness: 15,
  accessibility: 10,
} as const;

export const TOTAL_WEIGHT =
  FACTOR_WEIGHTS.settle +
  FACTOR_WEIGHTS.overshoot +
  FACTOR_WEIGHTS.onset +
  FACTOR_WEIGHTS.smoothness +
  FACTOR_WEIGHTS.accessibility;

/**
 * A property that cannot be animated on the compositor forces layout or paint
 * on every frame, which is the single most common cause of jank. Opacity and
 * transform are the only universally compositor-friendly properties.
 */
const COMPOSITOR_FRIENDLY: ReadonlySet<MotionTarget> = new Set<MotionTarget>([
  "translate",
  "scale",
  "rotate",
  "opacity",
]);

export function isCompositorFriendly(target: MotionTarget): boolean {
  return COMPOSITOR_FRIENDLY.has(target);
}

/**
 * Integrate a spring and return the full sampled trace plus the derived
 * measurements the scorer needs.
 */
interface SpringResult {
  trace: Array<{ t: number; value: number }>;
  settleTimeMs: number;
  overshoot: number;
  onsetMs: number;
  converges: boolean;
  peakVelocity: number;
  finalValue: number;
}

function integrateSpring(params: SpringParams): SpringResult {
  const { stiffness: k, damping: c, mass: m, displacement } = params;

  // Degenerate guards: a zero or negative mass would make the ODE blow up.
  const mass = m > 0 ? m : 1;
  const kEff = k > 0 ? k : 1;
  const cEff = c > 0 ? c : 0;

  let x = -Math.abs(displacement);
  let v = 0;

  const trace: Array<{ t: number; value: number }> = [];
  const steps = Math.ceil(MAX_SECONDS / DT);
  let settleTimeMs = -1;
  let peakOvershoot = 0;
  let peakVelocity = 0;

  // "Onset" is when the value has travelled the first 10% of its distance.
  let onsetMs = -1;
  const onsetFraction = 0.1 * Math.abs(displacement);

  // Undamped natural frequency, rad/s. Used for the velocity rest test.
  const omega = Math.sqrt(kEff / mass);
  const restDistance = Math.abs(displacement) * REST_THRESHOLD;
  // A body at rest distance x travelling at v would coast a further ~v/omega.
  // Requiring v <= restDistance * omega guarantees the motion would actually
  // stay put, instead of merely passing through the target at speed.
  const restVelocity = restDistance * omega;

  for (let i = 0; i <= steps; i++) {
    const t = i * DT;
    const progress = x / (displacement === 0 ? 1 : -displacement);
    // Trace is normalized to 0..1 travel from start to target, so the UI can
    // plot it regardless of the pixel magnitude of displacement.
    trace.push({ t: Math.round(t * 1000) / 1000, value: Math.round(progress * 1e6) / 1e6 });

    if (Math.abs(v) > peakVelocity) peakVelocity = Math.abs(v);
    if (x > peakOvershoot) peakOvershoot = x;
    if (onsetMs < 0 && Math.abs(x + displacement) >= onsetFraction) {
      onsetMs = t * 1000;
    }

    // Rest detection: close to the target AND slow enough to stay there.
    if (Math.abs(x) <= restDistance && Math.abs(v) <= restVelocity) {
      settleTimeMs = t * 1000;
      // Keep sampling a little past settle so the trace shows the tail.
      const tailSteps = Math.ceil(0.25 / DT);
      for (let j = 1; j <= tailSteps; j++) {
        const t2 = t + j * DT;
        const nextV = v + ((-kEff * x - cEff * v) / mass) * DT;
        const nextX = x + nextV * DT;
        x = nextX;
        v = nextV;
        const p2 = x / (displacement === 0 ? 1 : -displacement);
        trace.push({ t: Math.round(t2 * 1000) / 1000, value: Math.round(p2 * 1e6) / 1e6 });
      }
      break;
    }

    // Semi-implicit (symplectic) Euler: update velocity from force, then
    // position from the new velocity. Stable for stiff springs at this step.
    const accel = (-kEff * x - cEff * v) / mass;
    const nextV = v + accel * DT;
    const nextX = x + nextV * DT;
    x = nextX;
    v = nextV;
  }

  const converged = settleTimeMs >= 0;
  const finalValue = trace.length > 0 ? (trace[trace.length - 1]?.value ?? 1) : 1;

  return {
    trace,
    settleTimeMs: converged ? settleTimeMs : MAX_SECONDS * 1000,
    overshoot: Math.max(0, peakOvershoot / Math.abs(displacement || 1)),
    onsetMs: onsetMs < 0 ? MAX_SECONDS * 1000 : onsetMs,
    converges: converged,
    peakVelocity,
    finalValue,
  };
}

/**
 * Solve a 1-D cubic bezier easing function at progress t, exactly as CSS does.
 */
export function cubicBezierEase(x1: number, y1: number, x2: number, y2: number, t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  // Control point x-values must be in [0,1] for a valid timing function.
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleDX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  // Newton-Raphson converges in a handful of iterations for valid curves.
  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = sampleX(u) - t;
    if (Math.abs(x) < 1e-7) return sampleY(u);
    const d = sampleDX(u);
    if (Math.abs(d) < 1e-7) break;
    u -= x / d;
  }

  // Bisection fallback for ill-conditioned curves.
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

interface BezierResult {
  trace: Array<{ t: number; value: number }>;
  settleTimeMs: number;
  overshoot: number;
  onsetMs: number;
  converges: boolean;
  peakVelocity: number;
  finalValue: number;
}

function sampleBezier(params: BezierParams): BezierResult {
  const duration = params.durationMs > 0 ? params.durationMs : 1;
  const steps = 120;
  const trace: Array<{ t: number; value: number }> = [];
  let peakOvershoot = 0;
  let peakVelocity = 0;
  let onsetMs = -1;
  let prev = 0;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const value = cubicBezierEase(params.x1, params.y1, params.x2, params.y2, t);
    trace.push({ t: Math.round(t * 1000) / 1000, value: Math.round(value * 1e6) / 1e6 });
    if (value > peakOvershoot) peakOvershoot = value;
    if (value >= 0.1 && onsetMs < 0) onsetMs = t * duration;
    const velocity = Math.abs(value - prev) * (steps / (duration / 1000));
    if (velocity > peakVelocity) peakVelocity = velocity;
    prev = value;
  }

  return {
    trace,
    // A cubic bezier always terminates; "settling" = its full duration.
    settleTimeMs: duration,
    overshoot: Math.max(0, peakOvershoot - 1),
    onsetMs: onsetMs < 0 ? duration : onsetMs,
    converges: true,
    peakVelocity,
    finalValue: 1,
  };
}

/** Map a measured quantity to a 0..100 goodness score via a piecewise ramp. */
function bandScore(value: number, good: number, ok: number): number {
  if (value <= good) return 100;
  if (value >= ok) return 0;
  return Math.round(((ok - value) / (ok - good)) * 100);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Clamp any user-supplied params into a physically sane range. */
export function normalizeParams(params: MotionParams): MotionParams {
  if (params.kind === "spring") {
    return {
      kind: "spring",
      stiffness: clamp(params.stiffness, 1, 2000),
      damping: clamp(params.damping, 0, 400),
      mass: clamp(params.mass, 0.1, 50),
      displacement: clamp(params.displacement, 1, 1000),
    };
  }
  return {
    kind: "bezier",
    x1: clamp(params.x1, 0, 1),
    y1: clamp(params.y1, -3, 4),
    x2: clamp(params.x2, 0, 1),
    y2: clamp(params.y2, -3, 4),
    durationMs: clamp(params.durationMs, 16, 5000),
  };
}

function classify(
  kind: MotionParams["kind"],
  settleTimeMs: number,
  overshoot: number,
  converges: boolean,
): MotionAnalysis["band"] {
  if (!converges) return "chaotic";
  if (kind === "spring") {
    if (overshoot > 0.45) return "bouncy";
    if (settleTimeMs < 120) return "stiff";
    if (settleTimeMs <= 420) return "balanced";
    return "sluggish";
  }
  if (overshoot > 0.08) return "bouncy";
  if (settleTimeMs < 130) return "stiff";
  if (settleTimeMs <= 420) return "balanced";
  return "sluggish";
}

/**
 * The single source of truth for motion quality. Used by the UI, the REST
 * engine endpoint, the MCP tool, and the tests.
 */
export function analyzeMotion(params: MotionParams, target: MotionTarget, specId: string | null = null): MotionAnalysis {
  const safe = normalizeParams(params);
  const result = safe.kind === "spring" ? integrateSpring(safe) : sampleBezier(safe);

  // --- Factor 1: settle time -------------------------------------------------
  // 150ms or less feels instant; 600ms or more feels unresponsive.
  const settleScore = bandScore(result.settleTimeMs, 150, 600);

  // --- Factor 2: overshoot ---------------------------------------------------
  // A touch of overshoot (under 20%) reads as lively. Over 45% reads as sloppy.
  const overshootScore = bandScore(result.overshoot, 0.2, 0.45);

  // --- Factor 3: onset latency ----------------------------------------------
  // How fast the first 10% of travel happens. Under 60ms feels immediate.
  const onsetScore = bandScore(result.onsetMs, 60, 400);

  // --- Factor 4: smoothness --------------------------------------------------
  // Penalize non-converging motion and wild velocity spikes. Peak velocity is
  // normalized by displacement so scale does not affect the judgement.
  const velocityRatio = result.peakVelocity / Math.max(1, safe.kind === "spring" ? safe.displacement : 1);
  const jitterPenalty = result.converges ? 0 : 45;
  const smoothnessScore = clamp(
    Math.round(100 - jitterPenalty - bandScore(velocityRatio, 6, 22) * 0.9),
    0,
    100,
  );

  // --- Factor 5: accessibility ----------------------------------------------
  // Animating a layout-triggering property at high velocity causes real
  // discomfort for people with vestibular disorders, and blur is expensive.
  let accessibilityScore = 100;
  if (!isCompositorFriendly(target)) accessibilityScore -= 45;
  if (target === "blur") accessibilityScore -= 25;
  if (result.settleTimeMs > 500) accessibilityScore -= 20;
  if (result.overshoot > 0.6) accessibilityScore -= 20;
  accessibilityScore = clamp(accessibilityScore, 0, 100);

  const factors: ScoreFactor[] = [
    {
      id: "settle",
      label: "Settle time",
      value: settleScore,
      contribution: Math.round((settleScore * FACTOR_WEIGHTS.settle) / 100),
      evidence: result.converges
        ? `Comes to rest in ${Math.round(result.settleTimeMs)}ms (ideal is under 400ms).`
        : "Never settles within 6s: the spring is under-damped and will oscillate visibly.",
    },
    {
      id: "overshoot",
      label: "Overshoot",
      value: overshootScore,
      contribution: Math.round((overshootScore * FACTOR_WEIGHTS.overshoot) / 100),
      evidence: `Peaks ${(result.overshoot * 100).toFixed(1)}% past the target (0-20% reads as lively).`,
    },
    {
      id: "onset",
      label: "Onset latency",
      value: onsetScore,
      contribution: Math.round((onsetScore * FACTOR_WEIGHTS.onset) / 100),
      evidence: `Covers the first 10% of travel in ${Math.round(result.onsetMs)}ms.`,
    },
    {
      id: "smoothness",
      label: "Velocity profile",
      value: smoothnessScore,
      contribution: Math.round((smoothnessScore * FACTOR_WEIGHTS.smoothness) / 100),
      evidence: result.converges
        ? `Peak velocity is ${velocityRatio.toFixed(1)}x the travel distance, within a smooth range.`
        : "Velocity never decays: motion is oscillatory rather than settling.",
    },
    {
      id: "accessibility",
      label: "Accessibility",
      value: accessibilityScore,
      contribution: Math.round((accessibilityScore * FACTOR_WEIGHTS.accessibility) / 100),
      evidence: isCompositorFriendly(target)
        ? `"${target}" animates on the compositor without forcing layout.`
        : `"${target}" triggers layout or paint every frame and can cause vestibular discomfort.`,
    },
  ];

  const score = clamp(
    factors.reduce((sum, f) => sum + f.contribution, 0),
    0,
    100,
  );

  return {
    engineVersion: ENGINE_VERSION,
    specId,
    kind: safe.kind,
    score,
    band: classify(safe.kind, result.settleTimeMs, result.overshoot, result.converges),
    settleTimeMs: Math.round(result.settleTimeMs),
    overshoot: Math.round(result.overshoot * 1000) / 1000,
    onsetMs: Math.round(result.onsetMs),
    converges: result.converges,
    factors,
    trace: result.trace,
    // Filled in by the caller once the audit chain is available; the raw
    // analysis hash is stable for a given input and engine version.
    seal: "",
  };
}
