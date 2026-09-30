"use client";

/**
 * Agent console.
 *
 * A real JSON-RPC 2.0 client against the app's own `/api/mcp` endpoint. Every
 * button below issues an actual request and renders the actual response,
 * including failures. Nothing is mocked.
 */

import { useCallback, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/lib/site";
import { BENCH_SPRING } from "@/components/motion-primitives";

interface ToolCall {
  id: string;
  label: string;
  tool: string;
  args: Record<string, unknown>;
  description: string;
}

const CALLS: ToolCall[] = [
  {
    id: "init",
    label: "initialize",
    tool: "initialize",
    args: {},
    description: "Negotiate the protocol version and confirm the server is alive.",
  },
  {
    id: "tools",
    label: "tools/list",
    tool: "tools/list",
    args: {},
    description: "Discover every tool this server exposes, with its JSON schema.",
  },
  {
    id: "analyze",
    label: "analyze_motion",
    tool: "analyze_motion",
    args: {
      params: { kind: "spring", stiffness: 420, damping: 9, mass: 1, displacement: 100 },
      target: "scale",
    },
    description: "Score a bouncy spring without saving it. Returns the seal for those parameters.",
  },
  {
    id: "save",
    label: "save_spec",
    tool: "save_spec",
    args: {
      name: "Agent rubber band",
      description: "Created through the MCP tools/call endpoint.",
      target: "scale",
      params: { kind: "spring", stiffness: 420, damping: 9, mass: 1, displacement: 100 },
      idempotencyKey: "agent-console-demo-001",
    },
    description: "Persist a spec through the same service layer the UI uses. Idempotent.",
  },
  {
    id: "list",
    label: "list_specs",
    tool: "list_specs",
    args: { limit: 10 },
    description: "Read back everything this session owns, proving the mutation persisted.",
  },
  {
    id: "signals",
    label: "library_signals",
    tool: "library_signals",
    args: {},
    description: "Live npm registry state, with explicit live/fallback labelling.",
  },
  {
    id: "verify",
    label: "verify_integrity",
    tool: "verify_integrity",
    args: {},
    description: "Replay every per-entity SHA-384 chain and report the first broken link.",
  },
];

type Status = "idle" | "running" | "ok" | "error";

interface Entry {
  call: ToolCall;
  request: unknown;
  response: unknown;
  status: Status;
  ms: number;
  errorText?: string;
  specId?: string;
}

export function AgentConsole() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [raw, setRaw] = useState<string>("");
  const reduced = useReducedMotion();

  const invoke = useCallback(async (call: ToolCall) => {
    setBusy(true);
    const requestBody =
      call.tool === "initialize" || call.tool === "tools/list"
        ? { jsonrpc: "2.0", id: Date.now(), method: call.tool, params: {} }
        : {
            jsonrpc: "2.0",
            id: Date.now(),
            method: "tools/call",
            params: { name: call.tool, arguments: call.args },
          };

    const started = performance.now();
    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const json = (await res.json()) as Record<string, unknown>;
      const ms = Math.round(performance.now() - started);
      const isError = Boolean((json as { error?: unknown }).error) || res.status >= 400;

      // Pull a created spec id out of a save_spec response so we can link it.
      const structured = (json as { result?: { structuredContent?: { spec?: { id?: string } } } }).result
        ?.structuredContent;
      const specId: string | undefined = structured?.spec?.id;

      setEntries((prev) => [
        { call, request: requestBody, response: json, status: isError ? "error" : "ok", ms, ...(specId ? { specId } : {}) },
        ...prev,
      ]);
    } catch (err) {
      setEntries((prev) => [
        {
          call,
          request: requestBody,
          response: null,
          status: "error",
          ms: Math.round(performance.now() - started),
          errorText: err instanceof Error ? err.message : "network failure",
        },
        ...prev,
      ]);
    } finally {
      setBusy(false);
    }
  }, []);

  const runAll = useCallback(async () => {
    for (const call of CALLS) {
      await invoke(call);
    }
  }, [invoke]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header>
        <p className="label">JSON-RPC 2.0 · MCP</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Agent console</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          These buttons speak the same wire protocol an AI agent would. Each one issues a real
          request to <code className="rounded-sm bg-ink/8 px-1">/api/mcp</code> and renders the
          actual response — including when it fails.
        </p>
      </header>

      {/* Tool buttons */}
      <section className="mt-8" aria-label="Available tool calls">
        <div className="flex flex-wrap items-center gap-2">
          {CALLS.map((call) => (
            <button
              key={call.id}
              type="button"
              onClick={() => invoke(call)}
              disabled={busy}
              title={call.description}
              className="btn-ghost disabled:opacity-50"
            >
              {call.label}
            </button>
          ))}
          <button type="button" onClick={() => runAll()} disabled={busy} className="btn-bench disabled:opacity-50">
            {busy ? "running…" : "Run all in order"}
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-3">
          <strong>save_spec</strong> is the mutating tool. It writes through the identical service
          layer the browser uses and appends a sealed audit event, so an agent cannot bypass the
          integrity chain.
        </p>
      </section>

      {/* Responses */}
      <section className="mt-8" aria-label="Responses">
        <h2 className="text-xl">Responses</h2>

        {entries.length === 0 ? (
          <div className="panel mt-4 px-5 py-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
              no calls yet — pick a tool above
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {entries.map((entry, i) => (
              <motion.article
                key={`${entry.call.id}-${i}-${entry.ms}`}
                initial={reduced ? false : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={BENCH_SPRING}
                className="panel overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/12 bg-paper-2/50 px-4 py-2.5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-medium">{entry.call.tool}</span>
                    <span
                      className={`chip ${
                        entry.status === "ok"
                          ? "chip-live"
                          : entry.status === "error"
                            ? "chip-warn"
                            : ""
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <span className="mono text-[10px] uppercase tracking-widest text-ink-3">
                    {entry.ms}ms
                  </span>
                </div>

                <div className="grid gap-px bg-ink/12 md:grid-cols-2">
                  <div className="bg-paper p-4">
                    <p className="label">request</p>
                    <pre className="mono mt-2 max-h-56 overflow-auto text-[10px] leading-relaxed text-ink-2">
                      {JSON.stringify(entry.request, null, 2)}
                    </pre>
                  </div>
                  <div className="bg-paper p-4">
                    <p className="label">response</p>
                    {entry.errorText ? (
                      <p className="mono mt-2 text-[11px] text-ruby">{entry.errorText}</p>
                    ) : (
                      <pre className="mono mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-all text-[10px] leading-relaxed text-ink-2">
                        {JSON.stringify(entry.response, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                {entry.specId && (
                  <div className="border-t border-ink/12 px-4 py-2.5">
                    <Link
                      href={`/specs/${entry.specId}`}
                      className="font-mono text-[11px] uppercase tracking-widest text-ink underline decoration-signal-2 underline-offset-4"
                    >
                      persisted → open the created spec
                    </Link>
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* Raw transport */}
      <section className="mt-10" aria-label="Raw JSON-RPC">
        <h2 className="text-xl">Send a raw request</h2>
        <p className="mt-2 text-xs text-ink-3">
          The endpoint is a plain HTTP JSON-RPC 2.0 server, so any MCP client can drive it.
        </p>
        <textarea
          className="field mt-3 h-40 resize-y font-mono text-[11px]"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder='{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }'
          spellCheck={false}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-bench"
            disabled={busy || !raw.trim()}
            onClick={async () => {
              setBusy(true);
              const started = performance.now();
              try {
                const res = await fetch("/api/mcp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: raw,
                });
                const json = await res.json();
                setEntries((prev) => [
                  {
                    call: { id: "raw", label: "raw", tool: "custom", args: {}, description: "" },
                    request: (() => {
                      try {
                        return JSON.parse(raw);
                      } catch {
                        return raw;
                      }
                    })(),
                    response: json,
                    status: res.ok && !(json as { error?: unknown }).error ? "ok" : "error",
                    ms: Math.round(performance.now() - started),
                  },
                  ...prev,
                ]);
              } catch (err) {
                setEntries((prev) => [
                  {
                    call: { id: "raw", label: "raw", tool: "custom", args: {}, description: "" },
                    request: raw,
                    response: null,
                    status: "error",
                    ms: Math.round(performance.now() - started),
                    errorText: err instanceof Error ? err.message : "network failure",
                  },
                  ...prev,
                ]);
              } finally {
                setBusy(false);
              }
            }}
          >
            Send
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setRaw('{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "method": "tools/list"\n}')}
          >
            Load example
          </button>
        </div>
      </section>

      {/* Config */}
      <section className="mt-10" aria-label="Client configuration">
        <h2 className="text-xl">Point an MCP client at it</h2>
        <pre className="panel mono mt-3 overflow-auto p-4 text-[11px] leading-relaxed">
          {JSON.stringify(
            {
              mcpServers: {
                "folio-motion": {
                  type: "http",
                  url: `${siteConfig.mcp}`,
                },
              },
            },
            null,
            2,
          )}
        </pre>
        <p className="mt-2 text-xs text-ink-3">
          The published manifest lives at{" "}
          <a href="/mcp.json" className="underline decoration-signal-2 underline-offset-4">
            /mcp.json
          </a>
          .
        </p>
      </section>
    </div>
  );
}
