"use client";

/**
 * Specs library.
 *
 * Filter, sort and selection live in the URL so a view can be shared or
 * survived by a refresh. Deleting is a real DELETE with a confirm step, and a
 * failure leaves the row in place rather than pretending it worked.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MotionAnalysis, MotionSpec } from "@/lib/types";
import { BENCH_SPRING, StaggerGroup, StaggerItem, TiltCard } from "@/components/motion-primitives";
import { ScoreMeter } from "@/components/score-meter";

type SortKey = "newest" | "oldest" | "name";

export function SpecsLibrary() {
  const router = useRouter();
  const params = useSearchParams();
  const reduced = useReducedMotion();

  const sort = (params.get("sort") as SortKey) || "newest";
  const selected = params.get("spec");

  const [items, setItems] = useState<MotionSpec[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MotionAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/specs?limit=50", { cache: "no-store" });
      const json = (await res.json()) as { items?: MotionSpec[]; total?: number; error?: { message: string } };
      if (!res.ok) {
        setError(json.error?.message ?? `Could not load specs (${res.status})`);
        setItems([]);
        return;
      }
      const loaded = json.items ?? [];
      setItems(loaded);
      setTotal(json.total ?? loaded.length);
    } catch {
      setError("Could not reach the specs API.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  // Analyse the selected spec so the library doubles as a comparison surface.
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    (async () => {
      // Set after the microtask boundary so the effect body stays free of
      // synchronous state updates.
      await Promise.resolve();
      if (cancelled) return;
      setAnalyzing(true);
      try {
        const res = await fetch(`/api/specs/${selected}/analyze`, { method: "POST", cache: "no-store" });
        const json = (await res.json()) as MotionAnalysis & { error?: { message: string } };
        if (cancelled) return;
        setAnalysis(res.ok ? json : null);
      } catch {
        if (!cancelled) setAnalysis(null);
      } finally {
        if (!cancelled) setAnalyzing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  // When nothing is selected there is no analysis to show; clearing it during
  // render keeps the panel honest without a second effect.
  if (!selected && analysis) setAnalysis(null);

  const sorted = [...items].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "oldest") return a.createdAt < b.createdAt ? -1 : 1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null) next.delete(key);
      else next.set(key, value);
      const qs = next.toString();
      router.replace(qs ? `/specs?${qs}` : "/specs", { scroll: false });
    },
    [params, router],
  );

  const remove = useCallback(
    async (id: string) => {
      setDeleting(id);
      setError(null);
      try {
        const res = await fetch(`/api/specs/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const json = (await res.json()) as { error?: { message: string } };
          setError(json.error?.message ?? `Delete failed (${res.status})`);
          setConfirming(null);
          return;
        }
        setItems((prev) => prev.filter((s) => s.id !== id));
        setTotal((t) => Math.max(0, t - 1));
        if (selected === id) setParam("spec", null);
        setConfirming(null);
      } catch {
        setError("Could not reach the delete endpoint.");
      } finally {
        setDeleting(null);
      }
    },
    [selected, setParam],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Your bench</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Saved specs</h1>
          <p className="mt-2 text-sm text-ink-2">
            {loading ? "Loading…" : `${total} spec${total === 1 ? "" : "s"} in this session`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="label">
            sort
          </label>
          <select
            id="sort"
            className="field !w-auto !py-1.5"
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
          >
            <option value="newest">newest</option>
            <option value="oldest">oldest</option>
            <option value="name">name</option>
          </select>
          <Link href="/lab" className="btn-bench">
            New spec
          </Link>
        </div>
      </header>

      {error && (
        <p role="alert" className="mt-4 border border-ruby/40 bg-ruby/5 px-3 py-2 font-mono text-xs text-ruby">
          {error}
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && sorted.length === 0 && (
        <div className="panel mt-8 flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div aria-hidden className="h-px w-24 bg-ink/20" />
          <p className="font-display text-2xl">No specs on this bench yet</p>
          <p className="max-w-sm text-sm text-ink-2">
            Tune a spring or bezier in the lab, then save it. Saved specs persist to the database and
            can be exported or reviewed by an agent.
          </p>
          <Link href="/lab" className="btn-bench">
            Open the lab
          </Link>
        </div>
      )}

      {/* List */}
      {!loading && sorted.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <StaggerGroup className="grid gap-3 sm:grid-cols-2" amount={0.05}>
            {sorted.map((spec) => {
              const isSelected = selected === spec.id;
              return (
                <StaggerItem key={spec.id}>
                  <TiltCard max={4} className="h-full">
                    <article
                      className={`panel flex h-full flex-col p-4 transition-colors ${
                        isSelected ? "!border-ink bg-paper-2/60" : "hover:border-ink/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-display text-lg leading-tight">{spec.name}</h2>
                        <span className="chip shrink-0">{spec.target}</span>
                      </div>

                      {spec.description && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-ink-2">{spec.description}</p>
                      )}

                      <dl className="mt-3 grid grid-cols-2 gap-px border border-ink/12 bg-ink/12">
                        <div className="bg-paper px-2 py-1.5">
                          <dt className="label">model</dt>
                          <dd className="mono text-[11px]">{spec.params.kind}</dd>
                        </div>
                        <div className="bg-paper px-2 py-1.5">
                          <dt className="label">created</dt>
                          <dd className="mono text-[11px]">
                            {new Date(spec.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                        <button
                          type="button"
                          onClick={() => setParam("spec", isSelected ? null : spec.id)}
                          className="btn-ghost !px-2.5 !py-1 !text-[11px]"
                          aria-pressed={isSelected}
                        >
                          {isSelected ? "Hide score" : "Compare"}
                        </button>
                        <Link
                          href={`/specs/${spec.id}`}
                          className="btn-ghost !px-2.5 !py-1 !text-[11px]"
                        >
                          Open
                        </Link>
                        {confirming === spec.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => remove(spec.id)}
                              disabled={deleting === spec.id}
                              className="btn-bench !bg-ruby !border-ruby !px-2.5 !py-1 !text-[11px]"
                            >
                              {deleting === spec.id ? "…" : "Confirm"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirming(null)}
                              className="btn-ghost !px-2.5 !py-1 !text-[11px]"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirming(spec.id)}
                            className="btn-ghost !px-2.5 !py-1 !text-[11px] !text-ruby"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </article>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </StaggerGroup>

          {/* Comparison panel */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="panel panel-raised p-5">
              <h2 className="text-lg">Score detail</h2>
              <AnimatePresence mode="wait">
                {!selected && (
                  <motion.p
                    key="empty"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    className="mt-3 text-sm leading-relaxed text-ink-2"
                  >
                    Select <span className="font-mono">Compare</span> on any spec to see its live
                    score and the measured evidence behind each factor.
                  </motion.p>
                )}
                {selected && analyzing && (
                  <motion.p
                    key="loading"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    className="mono mt-3 text-[11px] uppercase tracking-widest text-ink-3"
                  >
                    integrating…
                  </motion.p>
                )}
                {selected && !analyzing && analysis && (
                  <motion.div
                    key={analysis.specId ?? "analysis"}
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -10 }}
                    transition={BENCH_SPRING}
                    className="mt-3"
                  >
                    <ScoreMeter analysis={analysis} />
                    <Link href={`/specs/${selected}`} className="btn-bench mt-4 w-full justify-center">
                      Full detail & export
                    </Link>
                  </motion.div>
                )}
                {selected && !analyzing && !analysis && (
                  <motion.p
                    key="missing"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    className="mono mt-3 text-[11px] text-ruby"
                  >
                    That spec could not be loaded.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </aside>
        </div>
      )}

      {loading && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="panel h-40 animate-pulse bg-ink/[0.03]" />
          ))}
        </div>
      )}
    </div>
  );
}
