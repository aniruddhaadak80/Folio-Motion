/**
 * Domain service layer.
 *
 * The UI, the REST routes and the MCP tools all call these functions. There is
 * exactly one code path for create, update, delete, analyze and export, so the
 * audit chain and the score can never disagree between surfaces.
 */

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { analyzeMotion, ENGINE_VERSION, normalizeParams } from "./engine";
import { sha384Hex, canonicalJson } from "./integrity";
import { getRepository, type Repository } from "./repository";
import type {
  ApiError,
  ApiErrorCode,
  CreateSpecInput,
  MotionAnalysis,
  MotionSpec,
  MotionTarget,
  UpdateSpecInput,
} from "./types";

export const NAME_MAX = 80;
export const DESCRIPTION_MAX = 400;

export const springSchema = z.object({
  kind: z.literal("spring"),
  stiffness: z.number().min(1).max(2000),
  damping: z.number().min(0).max(400),
  mass: z.number().min(0.1).max(50),
  displacement: z.number().min(1).max(1000),
});

export const bezierSchema = z.object({
  kind: z.literal("bezier"),
  x1: z.number().min(0).max(1),
  y1: z.number().min(-3).max(4),
  x2: z.number().min(0).max(1),
  y2: z.number().min(-3).max(4),
  durationMs: z.number().min(16).max(5000),
});

export const paramsSchema = z.discriminatedUnion("kind", [springSchema, bezierSchema]);

export const targetSchema = z.enum(["translate", "scale", "rotate", "opacity", "blur"]);

export const createSpecSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(NAME_MAX),
  description: z.string().trim().max(DESCRIPTION_MAX).optional(),
  target: targetSchema,
  params: paramsSchema,
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export const updateSpecSchema = z
  .object({
    name: z.string().trim().min(1).max(NAME_MAX).optional(),
    description: z.string().trim().max(DESCRIPTION_MAX).optional(),
    target: targetSchema.optional(),
    params: paramsSchema.optional(),
    idempotencyKey: z.string().min(8).max(128).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "at least one field is required" });

export function fail(code: ApiErrorCode, message: string, details?: unknown): ApiError {
  return { error: { code, message, ...(details === undefined ? {} : { details }) } };
}

function statusFor(code: ApiErrorCode): number {
  switch (code) {
    case "invalid_request":
      return 400;
    case "unauthorized":
      return 403;
    case "not_found":
      return 404;
    case "conflict":
      return 409;
    case "rate_limited":
      return 429;
    case "internal":
      return 500;
  }
}

export function statusForError(code: ApiErrorCode): number {
  return statusFor(code);
}

/**
 * Best-effort per-session write throttle. On serverless this is per-instance
 * and therefore approximate; see README for the hosted rate-limiter note.
 */
const WINDOW_MS = 60_000;
const MAX_WRITES_PER_WINDOW = 30;
const writeBudget = new Map<string, { count: number; resetAt: number }>();

export function checkWriteBudget(ownerId: string): ApiError | null {
  const now = Date.now();
  const entry = writeBudget.get(ownerId);
  if (!entry || now > entry.resetAt) {
    writeBudget.set(ownerId, { count: 1, resetAt: now + WINDOW_MS });
    if (writeBudget.size > 5000) {
      for (const [key, val] of writeBudget) {
        if (now > val.resetAt) writeBudget.delete(key);
      }
    }
    return null;
  }
  if (entry.count >= MAX_WRITES_PER_WINDOW) {
    return fail("rate_limited", `Too many writes. Try again in ${Math.ceil((entry.resetAt - now) / 1000)}s.`);
  }
  entry.count += 1;
  return null;
}

export async function withRepository<T>(fn: (repo: Repository) => Promise<T>): Promise<T> {
  const repo = await getRepository();
  await repo.init();
  return fn(repo);
}

/** Attach a stable seal to an analysis result derived from its own content. */
function sealAnalysis(analysis: MotionAnalysis, spec: MotionSpec | null): MotionAnalysis {
  const { seal: _ignored, ...rest } = analysis;
  const seal = sha384Hex(
    canonicalJson({
      engine: rest.engineVersion,
      specId: rest.specId,
      params: spec?.params ?? null,
      target: spec?.target ?? null,
      score: rest.score,
      settleTimeMs: rest.settleTimeMs,
      overshoot: rest.overshoot,
      factors: rest.factors.map((f) => ({ id: f.id, value: f.value, contribution: f.contribution })),
    }),
  );
  return { ...rest, seal };
}

export async function analyzeSpec(ownerId: string, specId: string): Promise<MotionAnalysis | ApiError> {
  return withRepository(async (repo) => {
    const spec = await repo.getSpec(ownerId, specId);
    if (!spec || spec.deleted) return fail("not_found", "Spec not found.");
    const analysis = sealAnalysis(analyzeMotion(spec.params, spec.target, spec.id), spec);
    await repo.appendAudit(spec.id, "analyzed", { engine: analysis.engineVersion, score: analysis.score }, ownerId);
    return analysis;
  });
}

export async function createSpec(ownerId: string, raw: unknown): Promise<MotionSpec | ApiError> {
  const parsed = createSpecSchema.safeParse(raw);
  if (!parsed.success) return fail("invalid_request", "Invalid spec payload.", parsed.error.issues);

  const budget = checkWriteBudget(ownerId);
  if (budget) return budget;

  const input: CreateSpecInput = {
    name: parsed.data.name,
    description: parsed.data.description ?? "",
    target: parsed.data.target,
    params: normalizeParams(parsed.data.params),
    ...(parsed.data.idempotencyKey ? { idempotencyKey: parsed.data.idempotencyKey } : {}),
  };

  return withRepository(async (repo) => {
    const spec = await repo.createSpec(ownerId, input);
    await repo.appendAudit(spec.id, "created", { spec: { ...spec } }, ownerId);
    return spec;
  });
}

export async function listSpecs(
  ownerId: string,
  limit: number,
  offset: number,
): Promise<{ items: MotionSpec[]; total: number } | ApiError> {
  return withRepository((repo) => repo.listSpecs(ownerId, limit, offset));
}

export async function getSpec(ownerId: string, id: string): Promise<MotionSpec | ApiError> {
  return withRepository(async (repo) => {
    const spec = await repo.getSpec(ownerId, id);
    if (!spec || spec.deleted) return fail("not_found", "Spec not found.");
    return spec;
  });
}

export async function updateSpec(
  ownerId: string,
  id: string,
  raw: unknown,
): Promise<MotionSpec | ApiError> {
  const parsed = updateSpecSchema.safeParse(raw);
  if (!parsed.success) return fail("invalid_request", "Invalid update payload.", parsed.error.issues);

  const budget = checkWriteBudget(ownerId);
  if (budget) return budget;

  const data = parsed.data;
  const input: UpdateSpecInput = {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.target !== undefined ? { target: data.target } : {}),
    ...(data.params !== undefined ? { params: normalizeParams(data.params) } : {}),
  };

  return withRepository(async (repo) => {
    const updated = await repo.updateSpec(ownerId, id, input);
    if (!updated) return fail("not_found", "Spec not found.");
    await repo.appendAudit(updated.id, "updated", { spec: { ...updated } }, ownerId);
    return updated;
  });
}

export async function deleteSpec(ownerId: string, id: string): Promise<MotionSpec | ApiError> {
  const budget = checkWriteBudget(ownerId);
  if (budget) return budget;
  return withRepository(async (repo) => {
    const deleted = await repo.deleteSpec(ownerId, id);
    if (!deleted) return fail("not_found", "Spec not found.");
    await repo.appendAudit(deleted.id, "deleted", { tombstone: deleted.id }, ownerId);
    return deleted;
  });
}

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export type ExportFormat = "css" | "framer" | "svg" | "report";

function fmt(n: number, digits = 2): string {
  return Number(n.toFixed(digits)).toString();
}

function toCssEasing(params: MotionSpec["params"]): string {
  if (params.kind === "bezier") {
    return `cubic-bezier(${fmt(params.x1, 3)}, ${fmt(params.y1, 3)}, ${fmt(params.x2, 3)}, ${fmt(params.y2, 3)})`;
  }
  // Springs are approximated as a duration/timing pair for CSS consumers.
  const zeta = params.damping / (2 * Math.sqrt(params.stiffness * params.mass));
  const easing = zeta < 1 ? "cubic-bezier(0.34, 1.56, 0.64, 1)" : "cubic-bezier(0.4, 0, 0.2, 1)";
  return easing;
}

export function renderExport(spec: MotionSpec, analysis: MotionAnalysis, format: ExportFormat): {
  filename: string;
  mime: string;
  body: string;
} {
  const slug = spec.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "motion-spec";
  // Provenance: the export carries the date it was generated.
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "css") {
    const body = `/* ${spec.name} — generated by Folio Motion on ${stamp}
   engine ${analysis.engineVersion} · score ${analysis.score}/100 · band ${analysis.band}
   settle ${analysis.settleTimeMs}ms · overshoot ${(analysis.overshoot * 100).toFixed(1)}%
   seal ${analysis.seal.slice(0, 24)}... */
.${slug} {
  transition-property: transform, opacity;
  transition-duration: ${analysis.settleTimeMs}ms;
  transition-timing-function: ${toCssEasing(spec.params)};
  will-change: transform, opacity;
}

@media (prefers-reduced-motion: reduce) {
  .${slug} {
    transition-duration: 1ms;
    transition-timing-function: linear;
  }
}
`;
    return { filename: `${slug}.css`, mime: "text/css", body };
  }

  if (format === "framer") {
    const transition =
      spec.params.kind === "spring"
        ? `{ type: "spring", stiffness: ${spec.params.stiffness}, damping: ${spec.params.damping}, mass: ${spec.params.mass} }`
        : `{ duration: ${fmt(spec.params.durationMs / 1000, 3)}, ease: [${fmt(spec.params.x1, 3)}, ${fmt(spec.params.y1, 3)}, ${fmt(spec.params.x2, 3)}, ${fmt(spec.params.y2, 3)}] }`;
    const body = `// ${spec.name} — generated by Folio Motion on ${stamp}
// engine ${analysis.engineVersion} · score ${analysis.score}/100 · band ${analysis.band}
import { motion, useReducedMotion } from "framer-motion";

export const ${slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}Transition = ${transition};

// Respect reduced-motion: collapse to an instant, opacity-only change.
export function use${slug.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase())}Transition() {
  const reduced = useReducedMotion();
  return reduced
    ? { duration: 0, ease: "linear" as const }
    : ${slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}Transition;
}
`;
    return { filename: `${slug}.motion.ts`, mime: "text/plain; charset=utf-8", body };
  }

  if (format === "svg") {
    // Draw the real integrated trace, not a decorative squiggle.
    const W = 600;
    const H = 200;
    const PAD = 20;
    const plot = analysis.trace
      .filter((p) => p.t <= analysis.settleTimeMs / 1000)
      .slice(0, 400);
    const minT = plot[0]?.t ?? 0;
    const maxT = plot[plot.length - 1]?.t ?? 1;
    const minV = Math.min(0, ...plot.map((p) => p.value));
    const maxV = Math.max(1, ...plot.map((p) => p.value));
    const spanT = Math.max(1e-6, maxT - minT);
    const spanV = Math.max(1e-6, maxV - minV);
    const points = plot
      .map((p) => {
        const x = PAD + ((p.t - minT) / spanT) * (W - PAD * 2);
        const y = H - PAD - ((p.value - minV) / spanV) * (H - PAD * 2);
        return `${fmt(x, 1)},${fmt(y, 1)}`;
      })
      .join(" ");
    const body = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${spec.name} motion curve">
  <rect width="${W}" height="${H}" fill="#14121c"/>
  <line x1="${PAD}" y1="${H - PAD}" x2="${W - PAD}" y2="${H - PAD}" stroke="#5a5470" stroke-width="1"/>
  <line x1="${PAD}" y1="${H - PAD}" x2="${PAD}" y2="${PAD}" stroke="#5a5470" stroke-width="1"/>
  <polyline fill="none" stroke="#c8f542" stroke-width="2.5" stroke-linejoin="round" points="${points}"/>
  <text x="${PAD}" y="${PAD - 6}" fill="#c8f542" font-family="monospace" font-size="12">${spec.name} · score ${analysis.score} · ${analysis.settleTimeMs}ms</text>
</svg>
`;
    return { filename: `${slug}.svg`, mime: "image/svg+xml", body };
  }

  const body = `# ${spec.name}

_Generated by Folio Motion on ${stamp}._
- **Engine:** ${analysis.engineVersion}
- **Score:** ${analysis.score}/100 (${analysis.band})
- **Settles in:** ${analysis.settleTimeMs} ms
- **Overshoot:** ${(analysis.overshoot * 100).toFixed(1)}%
- **Onset:** ${analysis.onsetMs} ms
- **Target property:** ${spec.target}
- **Seal:** ${analysis.seal}

## Parameters

\`\`\`json
${JSON.stringify(spec.params, null, 2)}
\`\`\`

## Why it scored this way

${analysis.factors.map((f) => `- **${f.label}** (${f.value}/100, +${f.contribution} pts) — ${f.evidence}`).join("\n")}

_Generated by Folio Motion. Specs are advisory design aids, not accessibility guarantees; verify against real users._
`;
  return { filename: `${slug}.md`, mime: "text/markdown; charset=utf-8", body };
}

export async function exportSpec(
  ownerId: string,
  specId: string,
  format: ExportFormat,
): Promise<{ spec: MotionSpec; analysis: MotionAnalysis; file: ReturnType<typeof renderExport> } | ApiError> {
  return withRepository(async (repo) => {
    const spec = await repo.getSpec(ownerId, specId);
    if (!spec || spec.deleted) return fail("not_found", "Spec not found.");
    const analysis = sealAnalysis(analyzeMotion(spec.params, spec.target, spec.id), spec);
    const file = renderExport(spec, analysis, format);
    await repo.appendAudit(spec.id, "exported", { format, seal: analysis.seal }, ownerId);
    return { spec, analysis, file };
  });
}

/** Non-persisted analysis for the live playground (no spec required). */
export function analyzeDraft(params: unknown, target: unknown): MotionAnalysis | ApiError {
  const parsedParams = paramsSchema.safeParse(params);
  const parsedTarget = targetSchema.safeParse(target);
  if (!parsedParams.success) return fail("invalid_request", "Invalid motion parameters.", parsedParams.error.issues);
  if (!parsedTarget.success) return fail("invalid_request", "Invalid target property.", parsedTarget.error.issues);
  const spec: MotionSpec = {
    id: "draft",
    name: "draft",
    description: "",
    target: parsedTarget.data as MotionTarget,
    params: normalizeParams(parsedParams.data),
    ownerId: "draft",
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    deleted: false,
  };
  return sealAnalysis(analyzeMotion(spec.params, spec.target, null), spec);
}

export function newIdempotencyKey(): string {
  return randomBytes(12).toString("base64url");
}

export { ENGINE_VERSION };
