/**
 * Core domain types for the Folio Motion lab.
 *
 * The central entity is a MotionSpec: a real, physical description of an
 * animation. A spec is either a critically-damped-ish spring (stiffness,
 * damping, mass) or a cubic-bezier easing curve. Both are integrated
 * numerically at request time so every measurement is derived, never invented.
 */

export type SpecKind = "spring" | "bezier";

/** Properties the engine knows how to reason about. */
export type MotionTarget = "translate" | "scale" | "rotate" | "opacity" | "blur";

export interface SpringParams {
  kind: "spring";
  /** Stiffness in N/m-ish units. Higher = faster. */
  stiffness: number;
  /** Damping ratio-ish coefficient. Higher = less oscillation. */
  damping: number;
  /** Mass of the animated value. */
  mass: number;
  /** Initial displacement from rest, in pixels-equivalent units. */
  displacement: number;
}

export interface BezierParams {
  kind: "bezier";
  /** First control point x, must be in [0, 1]. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Duration in milliseconds. */
  durationMs: number;
}

export type MotionParams = SpringParams | BezierParams;

export interface MotionSpec {
  id: string;
  name: string;
  description: string;
  target: MotionTarget;
  params: MotionParams;
  /** Owner scope: anonymous session id or "seed". */
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  /** True when soft-deleted (tombstone kept for hash-chain replay). */
  deleted: boolean;
}

/** A single factor contribution in the explainable score. */
export interface ScoreFactor {
  id: string;
  label: string;
  /** 0..100 where higher is better. */
  value: number;
  /** Signed contribution to the final score, in points. */
  contribution: number;
  /** Human-readable evidence for this factor. */
  evidence: string;
}

export interface MotionAnalysis {
  engineVersion: string;
  specId: string | null;
  kind: SpecKind;
  score: number;
  band: "stiff" | "balanced" | "soft" | "sluggish" | "bouncy" | "chaotic";
  settleTimeMs: number;
  /** Peak overshoot beyond the target, as a fraction (0.4 = 40% past). */
  overshoot: number;
  /** Perceived snappiness: how quickly the first 10% of travel is covered. */
  onsetMs: number;
  /** Whether the motion actually converges (springs under/over-damped). */
  converges: boolean;
  factors: ScoreFactor[];
  /** Discrete samples of the normalized position over normalized time. */
  trace: Array<{ t: number; value: number }>;
  /** SHA-384 seal of this analysis, chained to the spec's history. */
  seal: string;
}

/** A point on an append-only audit chain. */
export interface AuditEvent {
  id: string;
  specId: string;
  action: "created" | "updated" | "deleted" | "analyzed" | "exported";
  /** Canonical JSON of the event payload. */
  payload: string;
  /** SHA-384(UTF-8(prevSeal) || canonicalJson(event)). */
  seal: string;
  prevSeal: string;
  createdAt: string;
}

export interface FeedSignal {
  id: string;
  /** Upstream identifier, preserved for attribution. */
  sourceId: string;
  title: string;
  url: string;
  publishedAt: string;
  /** Where the data came from: "live" or "fallback". */
  origin: "live" | "fallback";
  sourceName: string;
  summary: string;
}

export interface FeedResponse {
  signals: FeedSignal[];
  status: "live" | "fallback";
  sourceName: string;
  fetchedAt: string;
  note: string;
}

export type ApiErrorCode =
  | "invalid_request"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "unauthorized"
  | "internal";

export interface ApiError {
  error: { code: ApiErrorCode; message: string; details?: unknown };
}

export interface CreateSpecInput {
  name: string;
  description?: string;
  target: MotionTarget;
  params: MotionParams;
  idempotencyKey?: string;
}

export interface UpdateSpecInput {
  name?: string;
  description?: string;
  target?: MotionTarget;
  params?: MotionParams;
  idempotencyKey?: string;
}
