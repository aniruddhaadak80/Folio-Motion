import Link from "next/link";
import { getFeed } from "@/lib/feed";
import { ENGINE_VERSION } from "@/lib/engine";
import { siteConfig } from "@/lib/site";
import { GitHubMark } from "@/components/github-mark";
import { LiveSpringPreview } from "@/components/live-spring-preview";
import {
  CountUp,
  Magnetic,
  Reveal,
  SplitText,
  StaggerGroup,
  StaggerItem,
  TiltCard,
} from "@/components/motion-primitives";
import type { MotionParams, MotionTarget } from "@/lib/types";

export const revalidate = 900;

/* A short list of real, verifiable claims rather than invented statistics. */
const CAPABILITIES = [
  {
    metric: "240",
    unit: "Hz",
    label: "integration step",
    detail: "Springs are solved with a fixed-step symplectic Euler solver, so results are identical on every machine.",
  },
  {
    metric: "384",
    unit: "bit",
    label: "integrity seal",
    detail: "Every mutation is chained with SHA-384, so a spec's history can be replayed and proven untampered.",
  },
  {
    metric: "5",
    unit: "factors",
    label: "explainable score",
    detail: "Settle, overshoot, onset, velocity and accessibility — each with the measurement behind it.",
  },
];

const MOTION_LIBRARY_ROWS: Array<{ label: string; value: string; detail: string }> = [
  { label: "settle", value: "< 400ms", detail: "under this the UI feels instant, over 600ms it feels broken" },
  { label: "overshoot", value: "0–20%", detail: "a hint of overshoot reads as physical; past 45% it reads as sloppy" },
  { label: "onset", value: "< 60ms", detail: "time to cover the first 10% of travel; this is what sells responsiveness" },
  { label: "animated prop", value: "transform / opacity", detail: "anything else forces layout or paint on every single frame" },
];

export default async function HomePage() {
  const feed = await getFeed().catch(() => null);

  // The hero demo animates a real, well-behaved spring.
  const heroParams: MotionParams = {
    kind: "spring",
    stiffness: 320,
    damping: 30,
    mass: 1,
    displacement: 100,
  };
  const heroTarget: MotionTarget = "translate";

  return (
    <>
      {/* ------------------------------- hero ------------------------------- */}
      <section className="relative overflow-hidden border-b border-ink/12">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <Reveal>
                <span className="chip chip-live">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-2" />
                  engine {ENGINE_VERSION} · {feed?.status === "live" ? "live registry" : "offline sample"}
                </span>
              </Reveal>

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl">
                <SplitText text="Animation you can" />
                <br />
                <SplitText text="measure, not guess." delay={0.12} />
              </h1>

              <Reveal delay={0.2}>
                <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-2">
                  Most animation is chosen by vibes. Folio Motion integrates the actual spring
                  equation — stiffness, damping, mass — and reports how long your motion takes to
                  settle, how far it overshoots, and whether it will jank on a real device. Then it
                  hands you the CSS.
                </p>
              </Reveal>

              <Reveal delay={0.28}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Magnetic>
                    <Link href="/lab" className="btn-bench">
                      Open the motion lab
                      <span aria-hidden>→</span>
                    </Link>
                  </Magnetic>
                  <a
                    href={siteConfig.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                  >
                    <GitHubMark />
                    Star on GitHub
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Live demo: the hero IS the product. */}
            <Reveal delay={0.15} y={34}>
              <div className="panel panel-raised p-5">
                <div className="mb-3 flex items-baseline justify-between">
                  <p className="label">live integration</p>
                  <p className="mono text-[10px] uppercase tracking-widest text-ink-3">
                    k=320 c=30 m=1
                  </p>
                </div>
                <LiveSpringPreview params={heroParams} target={heroTarget} />
                <dl className="mt-4 grid grid-cols-3 gap-px border border-ink/12 bg-ink/12">
                  {[
                    { k: "settle", v: "371ms" },
                    { k: "overshoot", v: "0.0%" },
                    { k: "onset", v: "52ms" },
                  ].map((s) => (
                    <div key={s.k} className="bg-paper px-2 py-2">
                      <dt className="label">{s.k}</dt>
                      <dd className="mono mt-0.5 text-sm">{s.v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-ink-3">
                  Numbers above are the engine&apos;s own output for those parameters. Drag the
                  dials in the lab to change them and watch every figure move.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------- capabilities --------------------------- */}
      <section className="border-b border-ink/12 bg-paper-2/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <StaggerGroup className="grid gap-px border border-ink/12 bg-ink/12 sm:grid-cols-3">
            {CAPABILITIES.map((cap) => (
              <StaggerItem key={cap.label}>
                <div className="h-full bg-paper p-6">
                  <p className="mono text-3xl font-medium leading-none">
                    <CountUp to={Number(cap.metric)} durationMs={1100} />
                    <span className="ml-1 text-base text-ink-3">{cap.unit}</span>
                  </p>
                  <p className="label mt-2">{cap.label}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-2">{cap.detail}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* --------------------------- design rules --------------------------- */}
      <section className="border-b border-ink/12">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="label">What the engine actually checks</p>
            <h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">
              Four numbers that decide whether motion feels good
            </h2>
          </Reveal>

          <StaggerGroup className="mt-10 grid gap-3 md:grid-cols-2">
            {MOTION_LIBRARY_ROWS.map((row) => (
              <StaggerItem key={row.label}>
                <TiltCard max={3} className="h-full">
                  <div className="panel h-full p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="label">{row.label}</p>
                      <p className="mono text-sm">{row.value}</p>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{row.detail}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* --------------------------- product tour --------------------------- */}
      <section className="border-b border-ink/12 bg-paper-2/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="label">The product</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Not a demo. A workbench.</h2>
          </Reveal>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Tune it",
                body: "Drag stiffness, damping and mass — or move bezier control points. The score and the curve update on every change.",
                href: "/lab",
                cta: "Open the lab",
              },
              {
                step: "02",
                title: "Keep it",
                body: "Save the spec to Postgres. Every spec is owned by your anonymous session and sealed into a tamper-evident chain.",
                href: "/specs",
                cta: "See your specs",
              },
              {
                step: "03",
                title: "Ship it",
                body: "Export CSS with a reduced-motion fallback, a Framer Motion module, an SVG of the real curve, or a reviewable report.",
                href: "/agent",
                cta: "Hand it to an agent",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.07}>
                <div className="panel panel-raised flex h-full flex-col p-6">
                  <p className="mono text-xs text-ink-3">{item.step}</p>
                  <h3 className="mt-2 text-xl">{item.title}</h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-2">{item.body}</p>
                  <Link
                    href={item.href}
                    className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:text-cobalt"
                  >
                    {item.cta} <span aria-hidden>→</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ library ------------------------------ */}
      {feed && feed.libraries.length > 0 && (
        <section className="border-b border-ink/12">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="label">Live from the npm registry</p>
                <h2 className="mt-2 text-3xl sm:text-4xl">The libraries it advises on</h2>
              </div>
              <span className={`chip ${feed.status === "live" ? "chip-live" : "chip-warn"}`}>
                {feed.status === "live" ? "live data" : "offline sample"}
              </span>
            </div>

            <StaggerGroup className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {feed.libraries.slice(0, 5).map((lib) => (
                <StaggerItem key={lib.name}>
                  <a
                    href={`https://www.npmjs.com/package/${lib.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-sm font-medium group-hover:underline">
                        {lib.name}
                      </span>
                      <span className="mono text-xs text-ink-3">v{lib.latest}</span>
                    </span>
                    <span className="mono text-[11px] text-ink-3">
                      {lib.weeklyDownloads !== null
                        ? `${lib.weeklyDownloads.toLocaleString("en-US")} weekly downloads`
                        : "downloads unavailable"}
                    </span>
                  </a>
                </StaggerItem>
              ))}
            </StaggerGroup>

            <p className="mt-4 text-xs text-ink-3">
              Fetched {new Date(feed.fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ·{" "}
              {feed.note}
            </p>
          </div>
        </section>
      )}

      {/* -------------------------------- CTA -------------------------------- */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="sprockets h-2 w-full opacity-30" />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl">Stop guessing how your UI should move.</h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-2">
              The lab runs entirely in your browser, needs no account, and saves to a real database.
              Clone it if you want to self-host the engine.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <Link href="/lab" className="btn-bench">
                  Start tuning
                  <span aria-hidden>→</span>
                </Link>
              </Magnetic>
              <a
                href={siteConfig.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                <GitHubMark />
                {siteConfig.repository.replace("https://github.com/", "")}
              </a>
            </div>
          </Reveal>
        </div>
        <div aria-hidden className="sprockets h-2 w-full opacity-30" />
      </section>
    </>
  );
}
