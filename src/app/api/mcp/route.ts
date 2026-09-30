/**
 * MCP-style JSON-RPC 2.0 endpoint.
 *
 * Implements `initialize`, `tools/list` and `tools/call` over HTTP POST. Every
 * tool delegates to the same service layer the browser UI uses, so an agent
 * and a human always produce the same audit events and the same seals.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OWNER_COOKIE, OWNER_COOKIE_OPTIONS, resolveSession } from "@/lib/session";
import { replayAllChains, replayChain } from "@/lib/integrity";
import { getRepository } from "@/lib/repository";
import {
  analyzeSpec,
  analyzeDraft,
  createSpec,
  deleteSpec,
  exportSpec,
  getSpec,
  listSpecs,
  updateSpec,
  ENGINE_VERSION,
  type ExportFormat,
} from "@/lib/service";
import { getFeed } from "@/lib/feed";
import type { ApiError } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = { name: "folio-motion-lab", version: "2.0.0" };

/* ------------------------------ JSON-RPC core ------------------------------ */

const JSONRPC_PARSE_ERROR = -32700;
const JSONRPC_INVALID_REQUEST = -32600;
const JSONRPC_METHOD_NOT_FOUND = -32601;
const JSONRPC_INVALID_PARAMS = -32602;

interface RpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

function rpcResult(id: string | number | null, result: unknown) {
  return { jsonrpc: "2.0" as const, id, result };
}

function rpcError(id: string | number | null, code: number, message: string, data?: unknown) {
  return { jsonrpc: "2.0" as const, id, error: { code, message, ...(data === undefined ? {} : { data }) } };
}

function isApiError(value: unknown): value is ApiError {
  return typeof value === "object" && value !== null && "error" in value;
}

/* --------------------------------- tools ---------------------------------- */

const TOOLS = [
  {
    name: "analyze_motion",
    description:
      "Score motion parameters without saving them. Returns settle time, overshoot, onset latency, itemized factor evidence and a SHA-384 seal. Use this to compare candidate curves before committing to one.",
    inputSchema: {
      type: "object",
      properties: {
        params: {
          oneOf: [
            {
              type: "object",
              properties: {
                kind: { const: "spring" },
                stiffness: { type: "number", minimum: 1, maximum: 2000 },
                damping: { type: "number", minimum: 0, maximum: 400 },
                mass: { type: "number", minimum: 0.1, maximum: 50 },
                displacement: { type: "number", minimum: 1, maximum: 1000 },
              },
              required: ["kind", "stiffness", "damping", "mass", "displacement"],
            },
            {
              type: "object",
              properties: {
                kind: { const: "bezier" },
                x1: { type: "number", minimum: 0, maximum: 1 },
                y1: { type: "number", minimum: -3, maximum: 4 },
                x2: { type: "number", minimum: 0, maximum: 1 },
                y2: { type: "number", minimum: -3, maximum: 4 },
                durationMs: { type: "number", minimum: 16, maximum: 5000 },
              },
              required: ["kind", "x1", "y1", "x2", "y2", "durationMs"],
            },
          ],
        },
        target: {
          type: "string",
          enum: ["translate", "scale", "rotate", "opacity", "blur"],
          description: "The property being animated. Compositor-friendly targets score higher on accessibility.",
        },
      },
      required: ["params", "target"],
    },
  },
  {
    name: "list_specs",
    description: "List the calling session's saved motion specs, newest first.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", minimum: 1, maximum: 100, default: 20 },
        offset: { type: "number", minimum: 0, default: 0 },
      },
    },
  },
  {
    name: "get_spec",
    description: "Fetch one saved motion spec together with its live analysis and seal.",
    inputSchema: {
      type: "object",
      properties: { specId: { type: "string" } },
      required: ["specId"],
    },
  },
  {
    name: "save_spec",
    description:
      "Create a new motion spec, or update an existing one when specId is supplied. Pass idempotencyKey to make retries safe.",
    inputSchema: {
      type: "object",
      properties: {
        specId: { type: "string", description: "Omit to create a new spec." },
        name: { type: "string", minLength: 1, maxLength: 80 },
        description: { type: "string", maxLength: 400 },
        target: { type: "string", enum: ["translate", "scale", "rotate", "opacity", "blur"] },
        params: { type: "object" },
        idempotencyKey: { type: "string", minLength: 8, maxLength: 128 },
      },
    },
  },
  {
    name: "delete_spec",
    description: "Soft-delete a spec. The tombstone is retained so the audit chain stays replayable.",
    inputSchema: {
      type: "object",
      properties: { specId: { type: "string" } },
      required: ["specId"],
    },
  },
  {
    name: "export_spec",
    description: "Render a saved spec as CSS, a Framer Motion module, an SVG curve, or a Markdown report.",
    inputSchema: {
      type: "object",
      properties: {
        specId: { type: "string" },
        format: { type: "string", enum: ["css", "framer", "svg", "report"], default: "report" },
      },
      required: ["specId"],
    },
  },
  {
    name: "library_signals",
    description:
      "Live release state for the animation libraries Folio Motion advises on, read from the public npm registry. Returns live or explicitly-labelled fallback data.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "verify_integrity",
    description:
      "Replay the append-only SHA-384 audit chain and report the first broken link. Pass specId to scope the check, or omit it to verify the whole chain.",
    inputSchema: {
      type: "object",
      properties: { specId: { type: "string" } },
    },
  },
] as const;

/* ------------------------------ tool dispatch ------------------------------ */

async function callTool(
  ownerId: string,
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "analyze_motion": {
      const result = analyzeDraft(args.params, args.target);
      if (isApiError(result)) throw Object.assign(new Error(result.error.message), { code: result.error.code });
      return result;
    }

    case "list_specs": {
      const limit = typeof args.limit === "number" ? Math.min(100, Math.max(1, Math.trunc(args.limit))) : 20;
      const offset = typeof args.offset === "number" ? Math.max(0, Math.trunc(args.offset)) : 0;
      const result = await listSpecs(ownerId, limit, offset);
      if (isApiError(result)) throw Object.assign(new Error(result.error.message), { code: result.error.code });
      return result;
    }

    case "get_spec": {
      const specId = String(args.specId ?? "");
      const spec = await getSpec(ownerId, specId);
      if (isApiError(spec)) throw Object.assign(new Error(spec.error.message), { code: spec.error.code });
      const analysis = await analyzeSpec(ownerId, specId);
      return { spec, analysis: isApiError(analysis) ? null : analysis };
    }

    case "save_spec": {
      const specId = args.specId ? String(args.specId) : null;
      const payload = {
        ...(args.name !== undefined ? { name: args.name } : {}),
        ...(args.description !== undefined ? { description: args.description } : {}),
        ...(args.target !== undefined ? { target: args.target } : {}),
        ...(args.params !== undefined ? { params: args.params } : {}),
        ...(args.idempotencyKey !== undefined ? { idempotencyKey: args.idempotencyKey } : {}),
      };
      const result = specId ? await updateSpec(ownerId, specId, payload) : await createSpec(ownerId, payload);
      if (isApiError(result)) throw Object.assign(new Error(result.error.message), { code: result.error.code });
      const analysis = await analyzeSpec(ownerId, result.id);
      return { spec: result, analysis: isApiError(analysis) ? null : analysis };
    }

    case "delete_spec": {
      const result = await deleteSpec(ownerId, String(args.specId ?? ""));
      if (isApiError(result)) throw Object.assign(new Error(result.error.message), { code: result.error.code });
      return { deleted: result.id, tombstone: true };
    }

    case "export_spec": {
      const format = (args.format ?? "report") as ExportFormat;
      const result = await exportSpec(ownerId, String(args.specId ?? ""), format);
      if (isApiError(result)) throw Object.assign(new Error(result.error.message), { code: result.error.code });
      return {
        filename: result.file.filename,
        mime: result.file.mime,
        content: result.file.body,
        score: result.analysis.score,
        seal: result.analysis.seal,
      };
    }

    case "library_signals":
      return getFeed();

    case "verify_integrity": {
      const repo = await getRepository();
      await repo.init();
      const specId = args.specId ? String(args.specId) : undefined;
      const events = await repo.listAudit(specId);
      // Scoped: one per-entity chain. Unscoped: every chain independently.
      return specId ? { scope: specId, ...replayChain(events) } : replayAllChains(events);
    }

    default:
      throw Object.assign(new Error(`Unknown tool: ${name}`), { code: "invalid_request" });
  }
}

/* --------------------------------- handler --------------------------------- */

export async function POST(request: Request) {
  const { ownerId, isNew } = await resolveSession();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const res = NextResponse.json(rpcError(null, JSONRPC_PARSE_ERROR, "Parse error"), { status: 400 });
    if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
    return res;
  }

  // Batch requests are part of JSON-RPC 2.0; support them.
  const isBatch = Array.isArray(body);
  const requests: RpcRequest[] = isBatch ? (body as RpcRequest[]) : [body as RpcRequest];

  if (isBatch && requests.length === 0) {
    return NextResponse.json(rpcError(null, JSONRPC_INVALID_REQUEST, "Empty batch"), { status: 400 });
  }

  const responses: unknown[] = [];

  for (const rpc of requests) {
    const id = rpc?.id ?? null;
    if (!rpc || typeof rpc !== "object" || rpc.jsonrpc !== "2.0" || typeof rpc.method !== "string") {
      responses.push(rpcError(id, JSONRPC_INVALID_REQUEST, "Invalid Request: expected { jsonrpc: '2.0', method }"));
      continue;
    }

    const params = (rpc.params ?? {}) as Record<string, unknown>;

    try {
      switch (rpc.method) {
        case "initialize":
          responses.push(
            rpcResult(id, {
              protocolVersion: PROTOCOL_VERSION,
              capabilities: { tools: { listChanged: false } },
              serverInfo: SERVER_INFO,
              instructions:
                "Folio Motion scores animation specs with a numerical physics engine. Call analyze_motion to compare candidate curves, save_spec to persist one, and verify_integrity to audit the history.",
            }),
          );
          break;

        case "notifications/initialized":
          // Notification: no response body per JSON-RPC 2.0.
          break;

        case "ping":
          responses.push(rpcResult(id, { ok: true, engine: ENGINE_VERSION }));
          break;

        case "tools/list":
          responses.push(rpcResult(id, { tools: TOOLS }));
          break;

        case "tools/call": {
          const name = typeof params.name === "string" ? params.name : "";
          const args = (params.arguments ?? {}) as Record<string, unknown>;
          const payload = await callTool(ownerId, name, args);
          responses.push(
            rpcResult(id, {
              content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
              structuredContent: payload,
              isError: false,
            }),
          );
          break;
        }

        default:
          responses.push(rpcError(id, JSONRPC_METHOD_NOT_FOUND, `Method not found: ${rpc.method}`));
      }
    } catch (err) {
      const domainCode = (err as { code?: string }).code;
      const message = err instanceof Error ? err.message : "Tool execution failed";
      if (domainCode && domainCode !== "invalid_request") {
        responses.push(
          rpcResult(id, {
            content: [{ type: "text", text: message }],
            structuredContent: { error: { code: domainCode, message } },
            isError: true,
          }),
        );
      } else {
        responses.push(rpcError(id, JSONRPC_INVALID_PARAMS, message));
      }
    }
  }

  const res = NextResponse.json(isBatch ? responses : (responses[0] ?? rpcError(null, JSONRPC_INVALID_REQUEST, "No response")), {
    headers: { "Cache-Control": "no-store" },
  });
  if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
  return res;
}

export async function GET() {
  return NextResponse.json(
    {
      protocol: "mcp-jsonrpc-2.0",
      endpoint: "/api/mcp",
      transport: "http POST",
      tools: TOOLS.map((t) => t.name),
      initialize: { protocolVersion: PROTOCOL_VERSION, serverInfo: SERVER_INFO },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
