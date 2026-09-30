"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { MotionAnalysis, MotionSpec } from "@/lib/types";
import { CurveChart } from "@/components/curve-chart";
import { ScoreMeter } from "@/components/score-meter";
import { LiveSpringPreview } from "@/components/live-spring-preview";
import { BENCH_SPRING } from "@/components/motion-primitives";
import { ENGINE_VERSION } from "@/lib/engine";

type ExportFormat = "css" | "framer" | "svg" | "report";

const FORMATS: Array<{ id: ExportFormat; label: string; ext: string }> = [
  { id: "css", label: "CSS", ext: ".css" },
  { id: "framer", label: "Framer Motion", ext: ".ts" },
  { id: "svg", label: "SVG curve", ext: ".svg" },
  { id: "report", label: "Report", ext: ".md" },
];

type State =
  | { kind: "loading" }
  | { kind: "ready"; spec: MotionSpec; analysis: MotionAnalysis }
  | { kind: "missing" }
  | { kind: "error"; message: string };

export function SpecDetail({ id }: { id: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [copied, setCopied] = useState<ExportFormat | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const reduced = useReducedMotion();

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const [specRes, analysisRes] = await Promise.all([
        fetch(`/api/specs/${id}`, { cache: "no-store" }),
        fetch(`/api/specs/${id}/analyze`, { method: "POST", cache: "no-store" }),
      ]);

      if (specRes.status === 404) {
        setState({ kind: "missing" });
        return;
      }
      if (!specRes.ok) {
        setState({ kind: "error", message: `Could not load this spec (${specRes.status}).` });
        return;
      }

      const spec = (await specRes.json()) as MotionSpec;
      const analysis = (await analysisRes.json()) as MotionAnalysis;
      if (!analysisRes.ok) {
        setState({ kind: "error", message: "Spec loaded but analysis failed." });
        return;
      }
      setState({ kind: "ready", spec, analysis });
    } catch {
      setState({ kind: "error", message: "Could not reach the API." });
    }
  }, [id]);

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

  const download = useCallback(
    async (format: ExportFormat) => {
      try {
        const res = await fetch(`/api/specs/${id}/export?format=${format}`, { cache: "no-store" });
        if (!res.ok) {
          const json = (await res.json()) as { error?: { message: string } };
          setState({ kind: "error", message: json.error?.message ?? `Export failed (${res.status})` });
          return;
        }
        const body = await res.text();
        const disposition = res.headers.get("Content-Disposition") ?? "";
        const match = /filename="([^"]+)"/.exec(disposition);
        const filename = match?.[1] ?? `motion-spec.${format}`;

        const blob = new Blob([body], { type: res.headers.get("Content-Type") ?? "text/plain" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        setCopied(format);
        setTimeout(() => setCopied(null), 2200);
      } catch {
        setState({ kind: "error", message: "Export request failed." });
      }
    },
    [id],
  );

  const remove = useCallback(async () => {
    try {
      const res = await fetch(`/api/specs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        setState({ kind: "error", message: json.error?.message ?? `Delete failed (${res.status})` });
        setConfirming(false);
        return;
      }
      setDeleted(true);
    } catch {
      setState({ kind: "error", message: "Could not reach the delete endpoint." });
    }
  }, [id]);

  /* ------------------------------- states ------------------------------- */

  if (state.kind === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="panel h-72 animate-pulse bg-ink/[0.03]" aria-hidden />
        <p className="sr-only" aria-live="polite">Loading spec…</p>
      </div>
    );
  }

  if (state.kind === "missing") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="label">404</p>
        <h1 className="mt-2 text-3xl">That spec is not here</h1>
        <p className="mt-3 text-sm text-ink-2">
          It may belong to a different session, or it was deleted. Specs are owned by the anonymous
          browser session that created them.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/specs" className="btn-bench">
            Back to specs
          </Link>
          <Link href="/lab" className="btn-ghost">
            Open the lab
          </Link>
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="label">Something went wrong</p>
        <h1 className="mt-2 text-3xl">Could not load this spec</h1>
        <p role="alert" className="mt-3 font-mono text-sm text-ruby">
          {state.message}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button type="button" onClick={() => void load()} className="btn-bench">
            Try again
          </button>
          <Link href="/specs" className="btn-ghost">
            Back to specs
          </Link>
        </div>
      </div>
    );
  }

  if (deleted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={BENCH_SPRING}
        >
          <p className="label">Deleted</p>
          <h1 className="mt-2 text-3xl">Spec removed</h1>
          <p className="mt-3 text-sm text-ink-2">
            The record is tombstoned so the audit chain stays replayable, but it no longer appears
            in your library.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/specs" className="btn-bench">
              Back to specs
            </Link>
            <Link href="/verify" className="btn-ghost">
              Verify the chain
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* -------------------------------- ready -------------------------------- */

  const { spec, analysis } = state;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link href="/specs" className="mono text-[11px] uppercase tracking-widest text-ink-3 hover:text-ink">
          ← all specs
        </Link>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl">{spec.name}</h1>
          <p className="mono mt-2 text-[11px] uppercase tracking-widest text-ink-3">
            {spec.params.kind} · {spec.target} · created{" "}
            {new Date(spec.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <span className="chip chip-live">{analysis.band}</span>
      </header>

      {spec.description && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-2">{spec.description}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <section className="panel p-5" aria-label="Preview">
            <h2 className="mb-3 text-lg">Preview</h2>
            <LiveSpringPreview params={spec.params} target={spec.target} />
          </section>

          <section className="panel p-5" aria-label="Measured curve">
            <h2 className="mb-3 text-lg">Measured curve</h2>
            <CurveChart trace={analysis.trace} settleTimeMs={analysis.settleTimeMs} />
          </section>

          <section className="panel p-5" aria-label="Parameters">
            <h2 className="mb-3 text-lg">Parameters</h2>
            <dl className="grid grid-cols-2 gap-px border border-ink/12 bg-ink/12 sm:grid-cols-4">
              {Object.entries(spec.params)
                .filter(([k]) => k !== "kind")
                .map(([key, value]) => (
                  <div key={key} className="bg-paper px-3 py-2">
                    <dt className="label">{key}</dt>
                    <dd className="mono mt-0.5 text-sm">{String(value)}</dd>
                  </div>
                ))}
            </dl>
          </section>

          <section className="panel p-5" aria-label="Export">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg">Export</h2>
              <span className="label">generated from the same engine</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">
              Every file below is rendered server-side from the stored spec and the engine result,
              with the seal embedded so you can prove which version produced it.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FORMATS.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => download(format.id)}
                  className="btn-ghost"
                >
                  {copied === format.id ? "Downloaded ✓" : `${format.label} ${format.ext}`}
                </button>
              ))}
            </div>
          </section>

          <section className="panel p-5" aria-label="Danger zone">
            <h2 className="text-lg">Delete</h2>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">
              Deleting tombstones the record. The audit events stay sealed and replayable so the
              history of this spec remains verifiable.
            </p>
            <div className="mt-3 flex gap-2">
              {confirming ? (
                <>
                  <button
                    type="button"
                    onClick={() => void remove()}
                    className="btn-bench !bg-ruby !border-ruby"
                  >
                    Confirm delete
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className="btn-ghost">
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="btn-ghost !text-ruby"
                >
                  Delete this spec
                </button>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="panel panel-raised p-5">
            <ScoreMeter analysis={analysis} />
            <div className="mt-4 border-t border-ink/12 pt-3">
              <p className="label">Provenance</p>
              <p className="mono mt-1 text-[10px] leading-relaxed text-ink-3">
                engine {ENGINE_VERSION}
                <br />
                seal {analysis.seal.slice(0, 32)}…
                <br />
                spec {spec.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
