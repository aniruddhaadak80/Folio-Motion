# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for a security problem.

Use GitHub's private reporting form:
**Security → Report a vulnerability** at
<https://github.com/aniruddhaadak80/Folio-Motion/security/advisories/new>

Include the affected route, the request you sent, what you expected, and what
happened instead. Please do not include real user data.

You can expect an acknowledgement within 72 hours and a fix or mitigation plan
within 7 days.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 2.x     | ✅        |
| < 2.0   | ❌        |

Version 1.x was an unmaintained static portfolio template and received no
security fixes. Its dependency tree carried 89 open Dependabot advisories,
which were removed by the 2.0 rewrite.

## Security posture of 2.x

### What this app does

- Accepts anonymous writes (motion specs) with no account system.
- Reads from a third-party public API (the npm registry).
- Runs a JSON-RPC endpoint that can mutate stored state.

### Measures in place

**Dependency hygiene.** The 2.x tree is deliberately small. `npm audit` is
clean, and CI fails the build on any error-level advisory. Alerts are closed by
removing unused dependencies rather than by pinning overrides, so a removed
package cannot silently return.

**Input validation.** Every request body is parsed with a Zod schema that
bounds string lengths, numeric ranges and enum values before any business logic
runs. Malformed input returns `400` with a stable error envelope; it is never
echoed back unescaped or reflected into HTML.

**Query safety.** All database access goes through one repository layer that
uses parameterised queries. No user value is concatenated into SQL. The one
interpolated identifier, the Postgres schema name, comes from a server-side
environment variable and is validated against a strict bare-identifier pattern
before it is used, so it cannot carry an injection payload.

**Session ownership.** Specs are owned by an unguessable scope id held in an
HTTP-only, `SameSite=Lax` cookie. Ownership is decided server-side from that
cookie; an id supplied in a request body is never trusted. A session cannot
read, update or delete another session's records — this is covered by an
assertion in `scripts/verify-live.mjs`.

**Write throttling.** Anonymous writes are rate limited to 30 per minute per
session. This budget is held in process memory, so on serverless it is
best-effort and per-instance. **For a hardened deployment, put a real rate
limiter (Upstash, Vercel KV, or an edge WAF rule) in front of `/api/specs` and
`/api/mcp`.**

**No secret leakage.** No API keys are required to run the core product. There
are none in the repository, in the client bundle, in the published MCP manifest,
or in error responses. `poweredByHeader` is disabled and the health endpoint
returns store *kind* and a fixed detail string, never the connection string.

**Transport headers.** All responses carry `X-Content-Type-Options`,
`X-Frame-Options: DENY`, `Referrer-Policy` and a restrictive
`Permissions-Policy`. See `next.config.ts`.

**Outbound requests.** The feed client allows exactly two origin patterns
(`registry.npmjs.org`, `api.npmjs.org`), enforces a 4.5s timeout, and never
retries in a loop. There is no user-controlled URL fetch anywhere in the app,
so the classic SSRF surface does not exist.

**Tamper evidence.** Every mutation is appended to a per-spec SHA-384 hash
chain. This is an *audit* control, not an access control: it makes silent edits
detectable and is verified at `/verify`, but it does not prevent an attacker
who already holds database credentials from rewriting the whole chain.

## Known limitations

- **No authentication.** Any visitor can create specs anonymously. Do not
  deploy this as the store for sensitive data.
- **Soft deletes are retained.** Deleted specs leave a tombstone so the audit
  chain stays replayable. Retention is indefinite; add a scheduled purge if
  that matters for your jurisdiction.
- **Rate limiting is per-instance.** See above.
- **The MCP endpoint is unauthenticated** and inherits the same anonymous
  session model. Scope every operation to the calling session — it already is —
  and put it behind the same rate limiter as the REST API.
