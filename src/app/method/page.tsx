import type { Metadata } from "next";
import Link from "next/link";
import { ENGINE_VERSION, FACTOR_WEIGHTS, TOTAL_WEIGHT } from "@/lib/engine";
import { GENESIS_SEAL } from "@/lib/integrity";
import { Reveal, StaggerGroup, StaggerItem, TiltCard } from "@/components/motion-primitives";

export const metadata: Metadata = {
  title: "Method",
  description:
    "Exactly how Folio Motion integrates springs, solves cubic beziers, and scores the result. No hidden heuristics.",
  alternates: { canonical: "/method" },
};

const FACTOR_NOTES: Array<{ id: keyof typeof FACTOR_WEIGHTS; label: string; how: string }> = [
  {
    id: "settle",
    label: "Settle time",
    how: "The first moment the value is within 0.5% of target AND slow enough that it would stay there. Requiring both conditions is what separates a spring that arrives from one that merely swings through at speed.",
  },
  {
    id: "overshoot",
    label: "Overshoot",
    how: "Peak position past the target, as a fraction of total travel. Measured from the integrated trace, not approximated from the damping ratio.",
  },
  {
    id: "onset",
    label: "Onset latency",
    how: "Time to cover the first 10% of travel. This is the number users actually feel as responsiveness, and it is independent of total duration.",
  },
  {
    id: "smoothness",
    label: "Velocity profile",
    how: "Peak velocity normalized by travel distance, penalized when the motion never converges. High normalized velocity reads as a snap rather than a glide.",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    how: "Penalties for animating layout-triggering properties, for blur, for very long settle times, and for extreme overshoot — all of which can cause discomfort for people with vestibular disorders.",
  },
];

export default function MethodPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header>
        <p className="label">Engine {ENGINE_VERSION}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Method</h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-2">
          Motion scores are only useful if you can see how they were produced. Everything below is
          the actual algorithm, in the order it runs.
        </p>
      </header>

      <Reveal>
        <section className="mt-10">
          <h2 className="text-2xl">1. Springs are integrated, not approximated</h2>
          <p className="prose-bench mt-3 text-sm leading-relaxed">
            A spring with stiffness <code>k</code>, damping <code>c</code> and mass <code>m</code>{" "}
            obeys <code>x&apos;&apos; = (−k·x − c·v) / m</code>. The engine starts from rest at the
            requested displacement and advances with a fixed-step semi-implicit (symplectic) Euler
            solver at 240 Hz — well above any display refresh rate.
          </p>
          <pre className="panel mono mt-3 overflow-auto p-4 text-[11px] leading-relaxed">{`const DT = 1 / 240;          // fixed step
for (let i = 0; i <= steps; i++) {
  const accel = (-k * x - c * v) / m;
  const vNext = v + accel * DT;   // velocity from force
  x = x + vNext * DT;             // position from new velocity
  v = vNext;
}`}</pre>
          <p className="prose-bench mt-3 text-sm leading-relaxed">
            The step size is fixed rather than adaptive, and that is deliberate: a fixed step is
            what makes the result <em>deterministic</em>. The same parameters produce a
            bit-identical trace on any machine, in any browser, forever. Integration stops after
            six seconds, after which a motion that has not settled is reported as
            non-convergent rather than given a made-up number.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10">
          <h2 className="text-2xl">2. Rest needs a velocity condition</h2>
          <p className="prose-bench mt-3 text-sm leading-relaxed">
            A common shortcut is to declare a spring settled when it passes within a small distance
            of the target. That is wrong: an under-damped spring passes through the target at high
            speed several times before it actually stops. Treating a fast pass as arrival reports
            zero overshoot for a violently bouncing motion.
          </p>
          <p className="prose-bench mt-3 text-sm leading-relaxed">
            Folio Motion requires both a position and a velocity condition. With{" "}
            <code>ω = √(k/m)</code> being the undamped natural frequency, a body at velocity{" "}
            <code>v</code> would coast roughly <code>v/ω</code> further, so rest is only declared
            when <code>|v| ≤ threshold · ω</code> as well as <code>|x| ≤ threshold</code>.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10">
          <h2 className="text-2xl">3. Beziers are solved like the browser solves them</h2>
          <p className="prose-bench mt-3 text-sm leading-relaxed">
            A cubic bezier easing function is not evaluated as a polynomial in time. The x
            component is inverted first — Newton-Raphson with a bisection fallback, then the y
            component is sampled at the resulting parameter. This is the same approach CSS uses
            for <code>cubic-bezier()</code>, which means a curve that looks right here behaves
            identically in a stylesheet.
          </p>
          <p className="prose-bench mt-3 text-sm leading-relaxed">
            Control-point x values are clamped to <code>[0, 1]</code> because a timing function
            with an x outside that range is not monotonic and would travel backwards in time.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10">
          <h2 className="text-2xl">4. Five weighted factors, all measured</h2>
          <p className="prose-bench mt-3 text-sm leading-relaxed">
            Each factor is a 0–100 goodness value derived from a measured quantity, multiplied by
            its weight. The score is the clamped sum, so the arithmetic is fully auditable: the
            contributions you see in the UI add up to the headline number.
          </p>

          <StaggerGroup className="mt-5 space-y-3">
            {FACTOR_NOTES.map((factor) => (
              <StaggerItem key={factor.id}>
                <TiltCard max={2}>
                  <div className="panel p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-mono text-sm">{factor.label}</h3>
                      <span className="mono text-xs text-ink-3">
                        weight {FACTOR_WEIGHTS[factor.id]} / {TOTAL_WEIGHT}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{factor.how}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10">
          <h2 className="text-2xl">5. History is sealed, not trusted</h2>
          <p className="prose-bench mt-3 text-sm leading-relaxed">
            Each spec owns an independent chain starting from a genesis value. Every event is
            sealed with <code>SHA-384(prevSeal ‖ canonicalJson(event))</code>, where the JSON is
            canonicalized by recursively sorting object keys. Replaying recomputes every seal and
            reports the first mismatch, so a silently edited record is detectable rather than
            merely improbable.
          </p>
          <p className="mono mt-3 text-[11px] text-ink-3">genesis = {GENESIS_SEAL.slice(0, 24)}…</p>
          <Link href="/verify" className="btn-bench mt-4">
            Replay the chain
            <span aria-hidden>→</span>
          </Link>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10 border-t border-ink/12 pt-8">
          <h2 className="text-2xl">Limits worth knowing</h2>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-2">
            <li>
              <strong>This is not a substitute for testing with users.</strong> The numbers
              describe physical behaviour. Whether a motion is <em>appropriate</em> is a design
              judgement no score can make.
            </li>
            <li>
              <strong>Frame cost is modelled, not measured.</strong> The engine reasons about which
              properties force layout, but it does not run a real compositor. Actual jank depends
              on the page, the device and the frame budget.
            </li>
            <li>
              <strong>Cubic beziers are sampled, not solved analytically.</strong> The trace has
              finite resolution; settle time for a bezier is its declared duration.
            </li>
            <li>
              <strong>Reduced motion is your responsibility in the output.</strong> Every exported
              CSS includes a <code>prefers-reduced-motion</code> block, and the Framer Motion
              export returns a zero-duration transition when the hook is set. Wire it up.
            </li>
          </ul>
        </section>
      </Reveal>
    </div>
  );
}
