<div align="center">

# Folio Motion

**Stop guessing how your UI should move. Measure it.**

[![Live app](https://img.shields.io/badge/live-folio--motion.vercel.app-c8f542?style=flat-square&logo=vercel)](https://folio-motion-aniruddha-adaks-projects.vercel.app)
[![Stars](https://img.shields.io/github/stars/aniruddhaadak80/Folio-Motion?style=flat-square&label=stars&color=c8f542)](https://github.com/aniruddhaadak80/Folio-Motion/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-7a5cc4?style=flat-square)](#license)
[![Security](https://img.shields.io/badge/security-0%20known%20vulnerabilities-34d399?style=flat-square)](SECURITY.md)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-087ea4?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![npm audit](https://img.shields.io/badge/npm%20audit-0%20vulnerabilities-34d399?style=flat-square)](https://github.com/advisories)

A **motion-physics lab for the browser**. Author a spring or cubic-bezier
animation, and the engine integrates the actual spring equation to tell you how
long it takes to settle, how far it overshoots, and whether it will jank — then
exports the CSS.

</div>

---

## The problem

Almost all UI animation is chosen by vibes. Someone writes
`transition: all 300ms ease` and moves on. Three questions never get answered:

- **Does it settle?** Or does it wobble?
- **How much does it overshoot?** Twenty percent reads as physical. Ninety
  percent reads as a bug.
- **Will it cause layout every frame?** Animating `width` or `filter` does.
  Animating `transform` does not.

Folio Motion answers those by doing the physics, not by looking up a table.

## The 10-second wow

Open the [lab](https://folio-motion-aniruddha-adaks-projects.vercel.app/lab),
drag **damping** from 30 down to 5, and watch three things happen at once: the
box starts bouncing, the settle-time readout climbs from `371ms` to `1246ms`, and
the score bar drops. All three are computed from a live numerical integration
of `x'' = (−k·x − c·v) / m` — the same function that renders the CSS you export.

---

## How it works

### 1. Springs are integrated, not approximated

A fixed-step semi-implicit (symplectic) Euler solver at 240 Hz — well above any
display refresh rate.

```ts
const DT = 1 / 240;
for (let i = 0; i <= steps; i++) {
  const accel = (-k * x - c * v) / m;
  const vNext = v + accel * DT;   // velocity from force
  x = x + vNext * DT;             // position from new velocity
  v = vNext;
}
```

The step size is **fixed**, not adaptive, and that is the whole point: fixed
step is what makes the result deterministic. The same parameters produce a
bit-identical trace on any machine, forever. There is a test that asserts this.

### 2. Rest requires a velocity condition

The obvious implementation — "settled when close to the target" — is wrong, and
this project ships a test proving it. An under-damped spring passes *through* the
target at high speed several times before it actually stops, so a
position-only test reports **zero overshoot for a violently bouncing motion**.

Folio Motion requires both conditions. With `ω = √(k/m)`:

```
settled  ⟺  |x| ≤ ε   AND   |v| ≤ ε·ω
```

Because a body at velocity `v` would coast roughly `v/ω` further, the second
condition is what proves the motion would *stay* put rather than merely pass
through.

```mermaid
flowchart LR
    A["Spring params<br/>k, c, m, x₀"] --> B["Integrate<br/>240 Hz fixed step"]
    B --> C{"At rest?<br/>|x| ≤ ε AND |v| ≤ ε·ω"}
    C -->|"no"| B
    C -->|"yes"| D["Record settle time"]
    B --> E["Track peak<br/>overshoot + onset"]
    D --> F["MotionAnalysis<br/>score · factors · trace · seal"]
    E --> F

    classDef data fill:#22d3ee,stroke:#0e7490,color:#0c4a6e
    classDef engine fill:#a78bfa,stroke:#6d28d9,color:#3b0764
    classDef out fill:#34d399,stroke:#047857,color:#064e3b
    class A,B,C data
    class D,E engine
    class F out
```

### 3. Five weighted, explainable factors

Every factor is a 0–100 value derived from a *measured* quantity, multiplied by
a weight. The contributions shown in the UI sum exactly to the headline score,
and there is a test asserting that.

| Factor | Weight | Measured from |
| --- | --- | --- |
| Settle time | 30 | First moment at rest, in ms |
| Overshoot | 25 | Peak position past target, as a fraction of travel |
| Onset latency | 20 | Time to cover the first 10% of travel |
| Velocity profile | 15 | Peak velocity normalized by distance |
| Accessibility | 10 | Whether the target property forces layout or paint |

### 4. Beziers are solved the way the browser solves them

The x component is inverted with Newton-Raphson (bisection fallback) and y is
sampled at the resulting parameter — the same approach CSS uses for
`cubic-bezier()`. A curve that looks right here behaves identically in a
stylesheet.

### 5. History is sealed, not trusted

Each spec owns an independent append-only chain:

```mermaid
flowchart TB
    subgraph C1["spec A chain"]
        E1["created<br/>seal 9f3a…"] --> E2["updated<br/>seal 41bc…"] --> E3["deleted<br/>seal c07e…"]
    end
    subgraph C2["spec B chain"]
        F1["created<br/>seal 5d22…"] --> F2["analyzed<br/>seal 88af…"]
    end
    G["genesis<br/>000…000"] -.-> E1
    G -.-> F1
    E3 --> R["replay: recompute<br/>every seal"]
    F2 --> R
    R --> V{"all match?"}
    V -->|"yes"| OK["intact<br/>head seal reported"]
    V -->|"no"| X["first broken link<br/>index + event id"]

    classDef data fill:#22d3ee,stroke:#0e7490,color:#0c4a6e
    classDef engine fill:#a78bfa,stroke:#6d28d9,color:#3b0764
    classDef ok fill:#34d399,stroke:#047857,color:#064e3b
    classDef bad fill:#fb7185,stroke:#be123c,color:#881337
    class E1,E2,E3,F1,F2,G data
    class R,V engine
    class OK ok
    class X bad
```

```ts
seal_n = SHA-384( UTF-8(prevSeal) || canonicalJson(event_n) )
```

`canonicalJson` sorts object keys recursively, drops `undefined`, and maps
non-finite numbers to `null`. That is what makes a seal computed in a browser
test identical to one computed on the server. Deleting a spec writes a
**tombstone** rather than removing the row, which is what keeps the chain
replayable.

---

## Features

- **Live physics preview** — a real element moved by the real integrator, not a
  CSS approximation. Scrub the timeline and watch it overshoot.
- **Measured curve with a 60fps frame grid** — the plot is the trace. The
  vertical red line is the actual settle time, so you can count frames.
- **Spring and bezier modes** — stiffness/damping/mass, or four control points
  and a duration, with a live damping-ratio readout.
- **Explainable scores** — expand any factor to see the number behind it and the
  threshold it is measured against.
- **Persistent specs** — anonymous session ownership, real Postgres, soft
  deletes, idempotent writes.
- **Four real exports** — CSS with a `prefers-reduced-motion` block, a Framer
  Motion module with a `useReducedMotion` hook, an SVG plotted from the actual
  trace, and a Markdown report for review.
- **MCP agent interface** — eight tools over JSON-RPC 2.0, including a mutating
  one that writes through the same service layer as the UI.
- **Tamper-evident history** — per-spec SHA-384 chains, replayable at `/verify`.
- **Live library signals** — real release state for `motion`, `framer-motion`,
  `react-spring`, `gsap` and `animejs` from the public npm registry, with
  honestly labelled fallback.
- **Reduced motion respected** — every animated affordance has a static
  equivalent, and the exports emit the CSS fallback for you.
- **Zero required environment variables** — clone, `npm install`, `npm run dev`.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess` |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Motion | Framer Motion 13 |
| Validation | Zod 4 |
| Database | Neon Postgres in production, embedded PGlite locally |
| Tests | Vitest 5 |
| Lint | ESLint 9 flat config, including the React Compiler rules |

## Quickstart

```bash
git clone https://github.com/aniruddhaadak80/Folio-Motion.git
cd Folio-Motion
npm install
npm run dev
```

Open <http://localhost:3000>. **No `.env` file, no database setup, no API
keys.** With no `DATABASE_URL` the app boots an embedded PGlite Postgres in
process.

For production you need exactly one variable:

```bash
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
# optional, when sharing one database with another app:
DATABASE_SCHEMA=folio_motion
```

The app **refuses to start in production without `DATABASE_URL`** rather than
falling back to an in-memory store that would lose everything on the next cold
start.

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run verify:live` | 65 real HTTP checks against a deployed URL |
| `npm run check` | All of the above, in order |

## Project map

### Routes

| Route | What it does |
| --- | --- |
| `/` | Landing: the live demo, the design rules, live library data |
| `/lab` | The workbench — tune, preview, score, save |
| `/specs` | Your library, with sort and comparison in the URL |
| `/specs/[id]` | Detail: curve, factors, provenance, four exports, delete |
| `/signals` | Live npm registry state, with provenance explained |
| `/agent` | Live MCP console — real requests, real responses |
| `/method` | Exactly how the engine works, and its limits |
| `/verify` | Replay the audit chain, find the first broken link |

### API

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/health` | `GET` | Runs a **real** query against the configured store |
| `/api/analyze` | `POST` | Stateless scoring for the live playground |
| `/api/specs` | `GET`, `POST` | List and create |
| `/api/specs/[id]` | `GET`, `PATCH`, `DELETE` | Read, update, tombstone |
| `/api/specs/[id]/analyze` | `POST` | Score a stored spec |
| `/api/specs/[id]/export` | `GET` | Real downloadable artifact |
| `/api/signals` | `GET` | Live feed with provenance |
| `/api/verify` | `GET` | Replay the chain |
| `/api/mcp` | `GET`, `POST` | JSON-RPC 2.0 agent interface |

### Try it

```bash
BASE=https://folio-motion-aniruddha-adaks-projects.vercel.app

# Score something without saving it
curl -s -X POST $BASE/api/analyze \
  -H 'content-type: application/json' \
  -d '{"params":{"kind":"spring","stiffness":420,"damping":9,"mass":1,"displacement":100},
       "target":"scale"}' | jq '{score,band,settleTimeMs,overshoot}'

# Save it (the session cookie is returned on first write)
curl -s -c jar.txt -X POST $BASE/api/specs \
  -H 'content-type: application/json' \
  -d '{"name":"Rubber band","target":"scale",
       "params":{"kind":"spring","stiffness":420,"damping":9,"mass":1,"displacement":100}}' | jq .id

# Read it back
curl -s -b jar.txt $BASE/api/specs/<ID> | jq .name

# Update it
curl -s -b jar.txt -X PATCH $BASE/api/specs/<ID> \
  -H 'content-type: application/json' \
  -d '{"params":{"kind":"spring","stiffness":500,"damping":40,"mass":1,"displacement":100}}' | jq .params.stiffness

# Export production CSS
curl -s -b jar.txt "$BASE/api/specs/<ID>/export?format=css"

# Verify the chain, then clean up
curl -s "$BASE/api/verify?specId=<ID>" | jq '{ok,checked,headSeal}'
curl -s -b jar.txt -X DELETE $BASE/api/specs/<ID> | jq .tombstone
```

## Agent interface

Point any MCP client at the endpoint:

```json
{
  "mcpServers": {
    "folio-motion": {
      "type": "http",
      "url": "https://folio-motion-aniruddha-adaks-projects.vercel.app/api/mcp"
    }
  }
}
```

Eight tools: `analyze_motion`, `list_specs`, `get_spec`, `save_spec`,
`delete_spec`, `export_spec`, `library_signals`, `verify_integrity`.

```bash
curl -s -X POST https://folio-motion-aniruddha-adaks-projects.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"analyze_motion",
                 "arguments":{"params":{"kind":"spring","stiffness":420,
                                         "damping":9,"mass":1,"displacement":100},
                              "target":"scale"}}}'
```

Every tool delegates to the same service layer the browser uses, so an agent and
a human produce identical audit events and identical seals. Mutating tools
accept an `idempotencyKey`.

Try all of it yourself at [`/agent`](https://folio-motion-aniruddha-adaks-projects.vercel.app/agent) —
those buttons issue the real requests.

## Architecture

```mermaid
flowchart TB
    U["Browser<br/>React 19 + Framer Motion"] -->|"HTTP"| R["Next.js 16<br/>App Router"]
    A["AI agent<br/>MCP client"] -->|"JSON-RPC 2.0"| M["/api/mcp"]
    M --> S["service.ts<br/>one code path"]
    R --> S
    S --> E["engine.ts<br/>pure, deterministic"]
    S --> I["integrity.ts<br/>canonical JSON + SHA-384"]
    S --> P["repository.ts<br/>all SQL, parameterised"]
    P --> D[("Neon Postgres<br/>production")]
    P --> L[("PGlite<br/>local, zero config")]
    S --> F["feed.ts<br/>npm registry, 4.5s timeout"]
    F --> N["registry.npmjs.org<br/>api.npmjs.org"]
    F -.->|"timeout"| FB["sealed fallback<br/>labelled, dated"]

    classDef data fill:#22d3ee,stroke:#0e7490,color:#0c4a6e
    classDef engine fill:#a78bfa,stroke:#6d28d9,color:#3b0764
    classDef agent fill:#34d399,stroke:#047857,color:#064e3b
    classDef ext fill:#fbbf24,stroke:#b45309,color:#451a03
    classDef infra fill:#94a3b8,stroke:#475569,color:#0f172a
    class D,L,N infra
    class E,I engine
    class M,A agent
    class F,FB ext
```

## Security

`npm audit` is clean, and CI fails the build on any moderate-or-worse advisory.

The 1.x template carried **89 open Dependabot advisories**. The 2.x rewrite
fixed them by removing 54 unused direct dependencies rather than pinning
overrides — a removed package cannot silently come back.

- All input validated with Zod before any business logic runs.
- All SQL parameterised; the only interpolated identifier is the schema name,
  validated against a strict bare-identifier pattern.
- Anonymous session ownership via an HTTP-only, `SameSite=Lax` cookie; the
  server never trusts an owner id from a request body.
- Write throttling, soft deletes, and no secrets in the bundle, manifest,
  logs or error responses.

Full detail, including **known limitations**, in
[`SECURITY.md`](SECURITY.md).

## Data provenance

Release state comes from the public npm registry:
`registry.npmjs.org/<package>` for versions and `api.npmjs.org/downloads` for
counts. Both are unauthenticated. If the registry cannot be reached within
4.5 seconds the app serves a **sealed sample dated 2026-01-15**, marked
`status: "fallback"` with every row `origin: "fallback"`. Fallback data is
never mixed with user-created specs and never presented as current.

Library names and download counts belong to their maintainers.

## Roadmap

**Now** — the engine, persistence, exports, MCP, integrity chain.

<details>
<summary><b>Next</b></summary>

```mermaid
flowchart LR
    A["Perceptual<br/>comparison"] --> B["Shared spec<br/>links"]
    B --> C["Import from<br/>CSS/Framer"]
    C --> D["Team token<br/>library"]

    classDef data fill:#22d3ee,stroke:#0e7490,color:#0c4a6e
    classDef engine fill:#a78bfa,stroke:#6d28d9,color:#3b0764
    class A engine
    class B,C,D data
```

- **Perceptual comparison** — play two specs against each other on one canvas.
- **Import** — paste a `cubic-bezier()` or a Framer Motion transition and get
  the parameters back, scored.
- **Shareable spec links** — a read-only public route per spec.
- **Token library** — promote a spec to a shared design-system token.

</details>

<details>
<summary><b>Later</b></summary>

```mermaid
flowchart LR
    A["Frame-budget<br/>estimator"] --> B["Reduced-motion<br/>auditor"]
    B --> C["Plugin for<br/>design tools"]

    classDef data fill:#22d3ee,stroke:#0e7490,color:#0c4a6e
    classDef engine fill:#a78bfa,stroke:#6d28d9,color:#3b0764
    class A engine
    class B,C data
```

- **Frame-budget estimator** — predict dropped frames from property count and
  travel distance, rather than only flagging layout-triggering properties.
- **Reduced-motion auditor** — scan a stylesheet and report every animation
  that ignores the media query.
- **Design-tool plugin** — push scores straight into Figma.

</details>

## Limitations

Stated plainly, because a scoring tool that oversells itself is worse than none:

- **This is not a substitute for testing with users.** The numbers describe
  physical behaviour. Whether a motion is *appropriate* is a design judgement.
- **Frame cost is modelled, not measured.** The engine knows which properties
  force layout; it does not run a real compositor.
- **Bezier traces are sampled** at finite resolution; a bezier's settle time is
  simply its declared duration.
- **Reduced motion is your job in the output.** Exports include the fallback,
  but you have to wire it up.

## Contributing

Issues and pull requests are welcome — see
[`CONTRIBUTING.md`](CONTRIBUTING.md). The contributions that help most make the
**physics more correct** or the **explainer clearer**.

## License

[MIT](LICENSE) © 2026 Aniruddha Adak

Motion scores are design aids, not accessibility guarantees. Verify against
real users.
