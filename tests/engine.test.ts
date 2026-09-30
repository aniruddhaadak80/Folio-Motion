import { describe, expect, it } from "vitest";
import {
  analyzeMotion,
  cubicBezierEase,
  ENGINE_VERSION,
  FACTOR_WEIGHTS,
  isCompositorFriendly,
  normalizeParams,
  TOTAL_WEIGHT,
} from "@/lib/engine";
import type { BezierParams, SpringParams } from "@/lib/types";

const spring = (over: Partial<SpringParams> = {}): SpringParams => ({
  kind: "spring",
  stiffness: 180,
  damping: 20,
  mass: 1,
  displacement: 100,
  ...over,
});

const bezier = (over: Partial<BezierParams> = {}): BezierParams => ({
  kind: "bezier",
  x1: 0.4,
  y1: 0,
  x2: 0.2,
  y2: 1,
  durationMs: 300,
  ...over,
});

describe("cubicBezierEase", () => {
  it("pins the endpoints for any valid curve", () => {
    expect(cubicBezierEase(0.4, 0, 0.2, 1, 0)).toBe(0);
    expect(cubicBezierEase(0.4, 0, 0.2, 1, 1)).toBe(1);
  });

  it("matches the CSS linear identity curve", () => {
    // cubic-bezier(0,0,1,1) is the identity easing.
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      expect(cubicBezierEase(0, 0, 1, 1, t)).toBeCloseTo(t, 6);
    }
  });

  it("reproduces a known ease-in-out value", () => {
    // cubic-bezier(0.42, 0, 0.58, 1) at t=0.5 is exactly 0.5 by symmetry.
    expect(cubicBezierEase(0.42, 0, 0.58, 1, 0.5)).toBeCloseTo(0.5, 6);
  });

  it("clamps out-of-range input rather than extrapolating", () => {
    expect(cubicBezierEase(0.4, 0, 0.2, 1, -1)).toBe(0);
    expect(cubicBezierEase(0.4, 0, 0.2, 1, 2)).toBe(1);
  });

  it("supports overshooting curves that exceed 1", () => {
    // cubic-bezier(0.34, 1.56, 0.64, 1) is the classic "back" ease: it peaks
    // past the target before settling. Scan for the true maximum.
    let peak = 0;
    for (let i = 0; i <= 1000; i++) {
      peak = Math.max(peak, cubicBezierEase(0.34, 1.56, 0.64, 1, i / 1000));
    }
    expect(peak).toBeGreaterThan(1.05);
    expect(peak).toBeLessThan(1.2);
  });
});

describe("normalizeParams", () => {
  it("clamps out-of-range spring values into a solvable range", () => {
    const n = normalizeParams(spring({ stiffness: -50, damping: 9999, mass: 0, displacement: 1e9 }));
    expect(n.kind).toBe("spring");
    if (n.kind !== "spring") throw new Error("unreachable");
    expect(n.stiffness).toBe(1);
    expect(n.damping).toBe(400);
    expect(n.mass).toBe(0.1);
    expect(n.displacement).toBe(1000);
  });

  it("forces bezier x control points into the legal [0,1] range", () => {
    const n = normalizeParams(bezier({ x1: -3, x2: 9 }));
    if (n.kind !== "bezier") throw new Error("unreachable");
    expect(n.x1).toBe(0);
    expect(n.x2).toBe(1);
  });

  it("preserves a valid curve unchanged", () => {
    const input = spring({ stiffness: 250, damping: 30 });
    expect(normalizeParams(input)).toEqual(input);
  });
});

describe("analyzeMotion — determinism", () => {
  it("returns byte-identical results for identical input", () => {
    const a = analyzeMotion(spring(), "translate");
    const b = analyzeMotion(spring(), "translate");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("stamps the current engine version", () => {
    expect(analyzeMotion(spring(), "translate").engineVersion).toBe(ENGINE_VERSION);
  });

  it("produces a non-empty trace with monotonic time", () => {
    const { trace } = analyzeMotion(spring(), "translate");
    expect(trace.length).toBeGreaterThan(10);
    for (let i = 1; i < trace.length; i++) {
      expect(trace[i]!.t).toBeGreaterThanOrEqual(trace[i - 1]!.t);
    }
  });
});

describe("analyzeMotion — physics", () => {
  it("converges for a well-damped spring", () => {
    const result = analyzeMotion(spring({ damping: 30 }), "translate");
    expect(result.converges).toBe(true);
    expect(result.settleTimeMs).toBeLessThan(2000);
  });

  it("flags an under-damped spring as non-convergent", () => {
    const result = analyzeMotion(spring({ stiffness: 400, damping: 0.5 }), "translate");
    expect(result.converges).toBe(false);
    expect(result.band).toBe("chaotic");
  });

  it("settles faster when stiffness rises", () => {
    const slow = analyzeMotion(spring({ stiffness: 60 }), "translate");
    const fast = analyzeMotion(spring({ stiffness: 600 }), "translate");
    expect(fast.settleTimeMs).toBeLessThan(slow.settleTimeMs);
  });

  it("reports zero overshoot when heavily over-damped", () => {
    const result = analyzeMotion(spring({ damping: 120 }), "translate");
    expect(result.overshoot).toBeLessThan(0.02);
  });

  it("reports measurable overshoot for a bouncy spring", () => {
    const result = analyzeMotion(spring({ stiffness: 300, damping: 8 }), "translate");
    expect(result.overshoot).toBeGreaterThan(0);
  });

  it("produces no NaN or Infinity anywhere in the trace", () => {
    for (const params of [
      spring({ stiffness: 1, damping: 0, mass: 50 }),
      spring({ stiffness: 2000, damping: 1, mass: 0.1 }),
      bezier({ x1: 0, y1: 4, x2: 1, y2: -3 }),
    ]) {
      const { trace } = analyzeMotion(params, "translate");
      for (const point of trace) {
        expect(Number.isFinite(point.t)).toBe(true);
        expect(Number.isFinite(point.value)).toBe(true);
      }
    }
  });
});

describe("analyzeMotion — scoring", () => {
  it("weights sum to the declared total", () => {
    const total = Object.values(FACTOR_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(TOTAL_WEIGHT);
  });

  it("keeps the score inside 0..100 for every input", () => {
    const cases = [
      spring({ stiffness: 1, damping: 0, mass: 50 }),
      spring({ stiffness: 2000, damping: 0.5, mass: 0.1 }),
      spring({ stiffness: 170, damping: 26, mass: 1 }),
      bezier({ durationMs: 16 }),
      bezier({ durationMs: 5000 }),
    ];
    for (const params of cases) {
      const { score } = analyzeMotion(params, "translate");
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(Number.isInteger(score)).toBe(true);
    }
  });

  it("returns exactly five factors whose contributions sum to the score", () => {
    const result = analyzeMotion(spring(), "translate");
    expect(result.factors).toHaveLength(5);
    const summed = result.factors.reduce((acc, f) => acc + f.contribution, 0);
    expect(Math.abs(summed - result.score)).toBeLessThanOrEqual(1);
  });

  it("gives every factor a non-empty evidence string", () => {
    for (const factor of analyzeMotion(spring(), "translate").factors) {
      expect(factor.evidence.length).toBeGreaterThan(10);
      expect(factor.label.length).toBeGreaterThan(0);
    }
  });

  it("scores a fast, well-damped spring above a slow, loose one", () => {
    const good = analyzeMotion(spring({ stiffness: 300, damping: 32 }), "translate");
    const bad = analyzeMotion(spring({ stiffness: 40, damping: 4 }), "translate");
    expect(good.score).toBeGreaterThan(bad.score);
  });

  it("penalises layout-triggering targets on accessibility", () => {
    const compositor = analyzeMotion(spring(), "translate");
    const layout = analyzeMotion(spring(), "blur");
    const accel = (r: typeof compositor) => r.factors.find((f) => f.id === "accessibility")!.value;
    expect(accel(compositor)).toBeGreaterThan(accel(layout));
  });

  it("classifies a non-convergent spring as chaotic", () => {
    expect(analyzeMotion(spring({ damping: 0 }), "translate").band).toBe("chaotic");
  });

  it("treats a bezier's settle time as its duration", () => {
    expect(analyzeMotion(bezier({ durationMs: 420 }), "translate").settleTimeMs).toBe(420);
  });
});

describe("isCompositorFriendly", () => {
  it("accepts transform and opacity, rejects blur", () => {
    expect(isCompositorFriendly("translate")).toBe(true);
    expect(isCompositorFriendly("scale")).toBe(true);
    expect(isCompositorFriendly("rotate")).toBe(true);
    expect(isCompositorFriendly("opacity")).toBe(true);
    expect(isCompositorFriendly("blur")).toBe(false);
  });
});
