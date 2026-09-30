"use client";

/**
 * Integrity verifier.
 *
 * Replays the SHA-384 chain live and reports the first broken link, scoped to a
 * single spec or across the whole ledger.
 */

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BENCH_SPRING } from "@/components/motion-primitives";

interface ReplayResult {
  ok: boolean;
  scope: string;
  chains?: number;
  events: number;
  checked: number;
  firstBrokenAt: number | null;
  firstBrokenId: string | null;
  reason: string | null;
  headSeal: string;
  chain?: Array<{ id: string; action: string; createdAt: string; seal: string; prevSeal: string }>;
  brokenChains?: Array<{ specId: string; reason: string | null }>;
  error?: { message: string };
}

export function IntegrityPanel() {
  const [scope, setScope] = useState<"global" | "spec">("global");
  const [specId, setSpecId] = useState("");
  const [result, setResult] = useState<ReplayResult | null>(null);
  const [loading, setLoading] = useState(true);
  const reduced = useReducedMotion();

  // Verify on mount and whenever the scope changes. All state updates happen
  // after the awaited fetch, never synchronously in the effect body.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = scope === "spec" && specId.trim() ? `?specId=${encodeURIComponent(specId.trim())}` : "";
        const res = await fetch(`/api/verify${qs}`, { cache: "no-store" });
        const json = (await res.json()) as ReplayResult;
        if (cancelled) return;
        setResult(json);
      } catch {
        if (cancelled) return;
        setResult({
          ok: false,
          scope,
          events: 0,
          checked: 0,
          firstBrokenAt: null,
          firstBrokenId: null,
          reason: "Could not reach the verify endpoint.",
          headSeal: "",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope, specId]);

  const verify = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const qs = scope === "spec" && specId.trim() ? `?specId=${encodeURIComponent(specId.trim())}` : "";
      const res = await fetch(`/api/verify${qs}`, { cache: "no-store" });
      setResult((await res.json()) as ReplayResult);
    } catch {
      setResult({
        ok: false,
        scope,
        events: 0,
        checked: 0,
        firstBrokenAt: null,
        firstBrokenId: null,
        reason: "Could not reach the verify endpoint.",
        headSeal: "",
      });
    } finally {
      setLoading(false);
    }
  }, [scope, specId]);

  const run = useCallback(() => {
    void verify();
  }, [verify]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header>
        <p className="label">Append-only · SHA-384</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Integrity</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          Every create, update, analysis, export and delete is appended to a per-spec chain where{" "}
          <code className="rounded-sm bg-ink/8 px-1">seal = SHA-384(prevSeal ‖ canonicalJson(event))</code>
          . Replaying recomputes each seal and reports the first link that does not match.
        </p>
      </header>

      <div className="panel panel-raised mt-8 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="scope" className="label">
              scope
            </label>
            <select
              id="scope"
              className="field mt-1.5 !w-40"
              value={scope}
              onChange={(e) => setScope(e.target.value as "global" | "spec")}
            >
              <option value="global">every chain</option>
              <option value="spec">one spec</option>
            </select>
          </div>
          {scope === "spec" && (
            <div className="flex-1">
              <label htmlFor="specId" className="label">
                spec id
              </label>
              <input
                id="specId"
                className="field mt-1.5"
                value={specId}
                onChange={(e) => setSpecId(e.target.value)}
                placeholder="e.g. 0f6c1e2a-…"
              />
            </div>
          )}
          <button type="button" onClick={run} disabled={loading} className="btn-bench">
            {loading ? "replaying…" : "Replay chain"}
          </button>
        </div>

        <div className="mt-5 min-h-[6rem]" aria-live="polite">
          {loading && (
            <p className="mono text-[11px] uppercase tracking-widest text-ink-3">recomputing seals…</p>
          )}

          {result && !loading && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={BENCH_SPRING}
            >
              <div
                className={`flex items-center gap-3 border px-4 py-3 ${
                  result.ok ? "border-signal-2 bg-signal/15" : "border-ruby/50 bg-ruby/5"
                }`}
              >
                <span
                  aria-hidden
                  className={`inline-block h-2.5 w-2.5 rounded-full ${result.ok ? "bg-signal-2" : "bg-ruby"}`}
                />
                <div>
                  <p className="font-mono text-sm font-medium">
                    {result.ok ? "Chain intact" : "Chain broken"}
                  </p>
                  <p className="mono text-[11px] text-ink-2">
                    {result.checked} event{result.checked === 1 ? "" : "s"} verified
                    {result.chains !== undefined ? ` across ${result.chains} chain${result.chains === 1 ? "" : "s"}` : ""}
                  </p>
                </div>
              </div>

              {!result.ok && (
                <div className="mt-3 border border-ruby/40 bg-ruby/5 px-3 py-2">
                  <p className="mono text-[11px] text-ruby">
                    First broken link at index {result.firstBrokenAt ?? "?"}
                    {result.firstBrokenId ? ` (${result.firstBrokenId})` : ""}
                  </p>
                  {result.reason && <p className="mt-1 text-xs text-ink-2">{result.reason}</p>}
                  {result.brokenChains && result.brokenChains.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.brokenChains.map((b) => (
                        <li key={b.specId} className="mono text-[10px] text-ruby">
                          {b.specId}: {b.reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <dl className="mt-4 grid gap-px border border-ink/12 bg-ink/12 sm:grid-cols-2">
                <div className="bg-paper px-3 py-2">
                  <dt className="label">scope</dt>
                  <dd className="mono mt-0.5 truncate text-[11px]">{result.scope}</dd>
                </div>
                <div className="bg-paper px-3 py-2">
                  <dt className="label">head seal</dt>
                  <dd className="mono mt-0.5 truncate text-[11px]">
                    {result.headSeal ? `${result.headSeal.slice(0, 32)}…` : "—"}
                  </dd>
                </div>
              </dl>

              {result.chain && result.chain.length > 0 && (
                <div className="mt-4">
                  <p className="label">chain</p>
                  <ol className="mt-2 space-y-1">
                    {result.chain.map((event, i) => (
                      <li
                        key={event.id}
                        className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/8 py-1.5"
                      >
                        <span className="mono text-[11px]">
                          <span className="text-ink-3">{String(i).padStart(2, "0")}</span>{" "}
                          <span className="ml-2">{event.action}</span>
                        </span>
                        <span className="mono text-[10px] text-ink-3">
                          {event.seal.slice(0, 16)}…
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl">How the seal is computed</h2>
        <pre className="panel mono mt-3 overflow-auto p-4 text-[11px] leading-relaxed">
{`canonicalJson(value):
  - object keys sorted recursively
  - arrays preserved in order
  - undefined dropped, non-finite numbers -> null

seal_n = SHA-384( UTF-8(prevSeal) || canonicalJson(event_n) )
prevSeal_0 = "${"0".repeat(96)}"   // genesis`}
        </pre>
        <p className="mt-3 text-xs leading-relaxed text-ink-2">
          Because the serialization is canonical, the same event always produces the same bytes, so
          a seal computed in a browser test is identical to one computed on the server. Deleting a
          spec writes a tombstone rather than removing the row, which is what keeps the chain
          replayable.
        </p>
      </section>
    </div>
  );
}
