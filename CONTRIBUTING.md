# Contributing

Thanks for taking the time. This project is small on purpose and the
contributions that help most are the ones that make the **physics** more
correct or the **explainer** clearer.

## Getting set up

```bash
git clone https://github.com/aniruddhaadak80/Folio-Motion.git
cd Folio-Motion
npm install
npm run dev
```

There is **no `.env` to create.** With no `DATABASE_URL` the app runs on an
embedded PGlite Postgres that boots with the process. See
[`.env.example`](.env.example) for the single variable production needs.

## Before you open a pull request

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint, flat config
npm test            # vitest
npm run build       # next build
```

`npm run check` runs all four in order. All four must pass. If lint or
typecheck fails, fix the code — do not add a suppression comment to get to
green. The exception is a genuine false positive in the React Compiler rules,
which is worth explaining in the PR description.

## Where things live

| Path | What belongs there |
| --- | --- |
| `src/lib/engine.ts` | The spring integrator, the bezier solver, the scoring. Pure functions, no I/O. |
| `src/lib/integrity.ts` | Canonical JSON, SHA-384 sealing, chain replay. Pure functions. |
| `src/lib/repository.ts` | All SQL. The only file allowed to know the schema exists. |
| `src/lib/service.ts` | The single code path for create/read/update/delete/analyze/export. |
| `src/lib/feed.ts` | The npm registry client, timeouts and the sealed fallback. |
| `src/app/api/**` | Thin HTTP wrappers over `service.ts`. No business logic. |
| `src/components/**` | Presentation. Client components only for interaction. |
| `tests/**` | Vitest. Every engine and integrity change needs a test. |

## Rules that are actually enforced

1. **One code path.** The UI, the REST routes and the MCP tools must all call
   `src/lib/service.ts`. If you add a second way to mutate a spec, the audit
   chain and the score will eventually disagree with each other.
2. **Never reimplement the engine in a component.** Import `analyzeMotion`.
   The preview in `live-spring-preview.tsx` deliberately re-integrates the ODE
   rather than calling the API on every frame, but it is a port of the same
   equation — if you change the integrator, change both and add a test that
   proves they agree.
3. **Determinism is a feature.** `analyzeMotion` must return byte-identical
   output for identical input on any machine. That is why integration uses a
   fixed timestep instead of a variable one. Do not introduce `Math.random()`,
   `Date.now()` or locale-dependent formatting into the engine.
4. **Honest states.** Every control needs a real loading, empty, success and
   failure state. Never fake a latency, never show a placeholder number, never
   present fallback data as live.
5. **No new runtime dependencies without discussion.** The dependency tree is
   the security boundary. Adding a package is a design decision, not a detail.

## Adding a scoring factor

The score is an auditable sum: the per-factor contributions shown in the UI
must add up to the headline number.

1. Add the weight to `FACTOR_WEIGHTS` in `engine.ts` and update `TOTAL_WEIGHT`.
2. Derive a 0–100 value from a *measured* quantity, never a vibe.
3. Add a `ScoreFactor` with evidence that names the measurement and the
   threshold, e.g. `"Comes to rest in 371ms (ideal is under 400ms)."`.
4. Add unit tests: a normal case, a boundary, a degenerate input, and a test
   that the contributions still sum to the score.
5. Update the factor list on `/method`.

## Adding a tool to the MCP endpoint

Tools are declared in `TOOLS` in `src/app/api/mcp/route.ts` and dispatched in
`callTool`. A new tool must:

- take only a session-scoped owner (never a caller-supplied owner id),
- support an `idempotencyKey` if it mutates,
- delegate to `service.ts` rather than touching SQL,
- return a typed error, not a thrown string.

## Reporting bugs

Open an issue with the route, what you did, what you expected, and what
happened. If it involves the engine, include the parameters — a spec is
reproducible from `{ kind, stiffness, damping, mass, displacement }` alone.

For anything security-related, do **not** open a public issue. Follow
[`SECURITY.md`](SECURITY.md).

## License

Contributions are accepted under the [MIT License](LICENSE).
