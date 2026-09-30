import type { Metadata } from "next";
import { getFeed } from "@/lib/feed";
import { FEED_REVALIDATE } from "@/lib/feed";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion-primitives";

export const metadata: Metadata = {
  title: "Library signals",
  description:
    "Live release state for the animation libraries Folio Motion advises on, read from the public npm registry.",
  alternates: { canonical: "/signals" },
};

export const revalidate = 900;

export default async function SignalsPage() {
  const feed = await getFeed();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Provenance</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Library signals</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
            The motion ecosystem moves fast. These are the live release states of the libraries
            this lab reasons about, pulled straight from the public npm registry with no API key.
          </p>
        </div>
        <span className={`chip ${feed.status === "live" ? "chip-live" : "chip-warn"}`}>
          {feed.status === "live" ? "live data" : "offline sample"}
        </span>
      </header>

      <p className="mono mt-3 text-[11px] uppercase tracking-widest text-ink-3">
        fetched {new Date(feed.fetchedAt).toUTCString()} · cached {FEED_REVALIDATE}s · {feed.note}
      </p>

      {feed.status === "fallback" && (
        <p role="status" className="mt-4 border border-ruby/40 bg-ruby/5 px-3 py-2 font-mono text-xs text-ruby">
          The registry is unreachable. You are seeing a sealed sample dated 2026-01-15, not current
          data. User-created specs are unaffected.
        </p>
      )}

      {feed.libraries.length > 0 && (
        <StaggerGroup className="mt-8 grid gap-px border border-ink/12 bg-ink/12 sm:grid-cols-2">
          {feed.libraries.map((lib) => (
            <StaggerItem key={lib.name}>
              <a
                href={`https://www.npmjs.com/package/${lib.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full bg-paper p-5 transition-colors hover:bg-paper-2/60"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-mono text-base font-medium">{lib.name}</h2>
                  <span className="mono text-xs text-ink-3">v{lib.latest}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-2">
                  {lib.description || "No description published."}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-px border border-ink/12 bg-ink/12">
                  <div className="bg-paper px-2 py-1.5">
                    <dt className="label">weekly</dt>
                    <dd className="mono text-[11px]">
                      {lib.weeklyDownloads !== null
                        ? lib.weeklyDownloads.toLocaleString("en-US")
                        : "n/a"}
                    </dd>
                  </div>
                  <div className="bg-paper px-2 py-1.5">
                    <dt className="label">published</dt>
                    <dd className="mono text-[11px]">
                      {new Date(lib.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "2-digit",
                      })}
                    </dd>
                  </div>
                </dl>
              </a>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {feed.signals.length > 0 && (
        <Reveal>
          <section className="mt-12">
            <h2 className="text-2xl">Raw feed</h2>
            <div className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {feed.signals.map((signal) => (
                <a
                  key={signal.id}
                  href={signal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-sm">{signal.sourceId}</span>
                    <span className={`chip ${signal.origin === "live" ? "chip-live" : "chip-warn"}`}>
                      {signal.origin}
                    </span>
                  </span>
                  <span className="mono text-[11px] text-ink-3">
                    {new Date(signal.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "2-digit",
                    })}
                    {" · "}
                    {signal.sourceName}
                  </span>
                </a>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      <Reveal>
        <section className="mt-12">
          <h2 className="text-2xl">Data provenance</h2>
          <div className="prose-bench mt-4 space-y-3 text-sm">
            <p>
              <strong>Source.</strong> The npm registry public endpoint{" "}
              <code>https://registry.npmjs.org/&lt;package&gt;</code> for release metadata, and{" "}
              <code>https://api.npmjs.org/downloads/point/last-week/&lt;package&gt;</code> for
              download counts. Both are public and unauthenticated.
            </p>
            <p>
              <strong>Fallback.</strong> When the registry cannot be reached within 4.5 seconds, the
              app serves a sealed sample dated 2026-01-15. It is labelled{" "}
              <code>status: &quot;fallback&quot;</code> and every row is marked{" "}
              <code>origin: &quot;fallback&quot;</code>. Fallback data is never mixed with
              user-created specs.
            </p>
            <p>
              <strong>Attribution.</strong> Library names, versions and download counts belong to
              their respective maintainers. Folio Motion reads them read-only and claims no
              ownership.
            </p>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
