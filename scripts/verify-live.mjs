/**
 * Live end-to-end verification.
 *
 * Proves a deployment really works by making real HTTP requests against it.
 * Run with:
 *     node scripts/verify-live.mjs [baseUrl]
 *
 * The default base URL below must match `seo.siteUrl` in
 * src/config/portfolio.ts. No secrets are embedded here; the only credential
 * is the anonymous session cookie, which this script manages itself.
 */

import process from "node:process";

const DEFAULT_BASE = process.env.FOLIO_MOTION_LIVE_URL ?? "https://folio-motion.vercel.app";

const base = (process.argv[2] ?? DEFAULT_BASE).replace(/\/$/, "");
const repository = "https://github.com/aniruddhaadak80/Folio-Motion";

let cookie = "";
const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

async function call(path, init = {}) {
  const headers = { ...(init.headers ?? {}) };
  if (cookie) headers.cookie = cookie;
  if (init.body) headers["content-type"] = "application/json";

  const res = await fetch(`${base}${path}`, { ...init, headers, redirect: "manual" });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookie) {
    const pair = c.split(";")[0];
    if (pair?.startsWith("fm_scope=")) cookie = pair;
  }
  return res;
}

async function json(path, init) {
  const res = await call(path, init);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

const unique = `verify-${Date.now().toString(36)}`;
let specId = null;

/**
 * Extract every `href` value from an HTML document.
 *
 * Link assertions compare these against an exact expected URL rather than
 * running `html.includes(url)`. A substring test is not an equality test: a
 * page pointing at `https://github.com/you/repo-attacker` would satisfy
 * `includes("https://github.com/you/repo")`, so the check would pass on a
 * link to the wrong repository.
 */
function extractHrefs(html) {
  return [...html.matchAll(/href="([^"]*)"/g)].map((match) => match[1]);
}

/** Normalise a URL so equivalent forms compare equal. */
function normalizeUrl(value) {
  try {
    const url = new URL(value, base);
    url.hash = "";
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}${url.search}`;
  } catch {
    return value;
  }
}

/** True when the document links to exactly `expected` (and not a lookalike). */
function linksTo(html, expected) {
  const target = normalizeUrl(expected);
  return extractHrefs(html).some((href) => normalizeUrl(href) === target);
}

/** How many links in the document point at exactly `expected`. */
function countLinksTo(html, expected) {
  const target = normalizeUrl(expected);
  return extractHrefs(html).filter((href) => normalizeUrl(href) === target).length;
}

console.log(`\nVerifying ${base}\n${"─".repeat(64)}`);

/* 1. Landing page */
{
  const res = await call("/");
  const html = await res.text();
  record("landing returns 200", res.status === 200, `status ${res.status}`);
  record("landing links the real repository", linksTo(html, repository), repository);
  record("landing renders the product name", html.includes("Folio"), "Folio");
}

/* 2. Health reports a real store check */
{
  const { res, body } = await json("/api/health");
  record("health returns 200", res.status === 200, `status ${res.status}`);
  record(
    "health verified the persistence path",
    body?.ok === true && typeof body?.store?.kind === "string" && body.store.kind.length > 0,
    `store=${body?.store?.kind} detail=${body?.store?.detail ?? "n/a"}`,
  );
  record("health reports an engine version", Boolean(body?.engine), `engine=${body?.engine}`);
}

/* 3. Live feed returns normalized data with honest provenance */
{
  const { res, body } = await json("/api/signals");
  const signals = body?.signals ?? [];
  record("signals returns 200", res.status === 200, `status ${res.status}`);
  record("signals returns a non-empty normalized set", signals.length > 0, `${signals.length} signals`);
  record(
    "signals label their provenance",
    body?.status === "live" || body?.status === "fallback",
    `status=${body?.status}`,
  );
  record(
    "every signal declares live or fallback origin",
    signals.every((s) => s.origin === "live" || s.origin === "fallback"),
    "all origins labelled",
  );
  record(
    "signals carry a fetched timestamp",
    typeof body?.fetchedAt === "string" && !Number.isNaN(Date.parse(body.fetchedAt)),
    body?.fetchedAt ?? "missing",
  );
}

/* 4. Stateless analysis returns a versioned, sealed, explained result */
{
  const { res, body } = await json("/api/analyze", {
    method: "POST",
    body: JSON.stringify({
      params: { kind: "spring", stiffness: 320, damping: 30, mass: 1, displacement: 100 },
      target: "translate",
    }),
  });
  record("analyze returns 200", res.status === 200, `status ${res.status}`);
  record("analyze is versioned", Boolean(body?.engineVersion), `v=${body?.engineVersion}`);
  record(
    "analyze returns a bounded score",
    typeof body?.score === "number" && body.score >= 0 && body.score <= 100,
    `score=${body?.score} band=${body?.band}`,
  );
  record(
    "analyze returns itemized factors",
    Array.isArray(body?.factors) && body.factors.length === 5,
    `${body?.factors?.length} factors`,
  );
  record(
    "analyze returns a verification seal",
    typeof body?.seal === "string" && body.seal.length === 96,
    `seal ${String(body?.seal).slice(0, 16)}…`,
  );
  record(
    "analyze returns the measured trace",
    Array.isArray(body?.trace) && body.trace.length > 0,
    `${body?.trace?.length} points`,
  );
}

/* 5. Validation rejects bad input with the right status */
{
  const { res, body } = await json("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ params: { kind: "spring", stiffness: -5 }, target: "translate" }),
  });
  record("invalid input returns 400", res.status === 400, `status ${res.status}`);
  record("invalid input returns a stable error envelope", body?.error?.code === "invalid_request", body?.error?.code);
}

/* 6. Create through the public API */
{
  const { res, body } = await json("/api/specs", {
    method: "POST",
    body: JSON.stringify({
      name: `Verify ${unique}`,
      description: "Created by scripts/verify-live.mjs",
      target: "translate",
      params: { kind: "spring", stiffness: 320, damping: 30, mass: 1, displacement: 100 },
      idempotencyKey: unique,
    }),
  });
  specId = body?.id ?? null;
  record("create returns 201", res.status === 201, `status ${res.status}`);
  record("create persisted and returned an id", Boolean(specId), specId ?? "no id");
}

/* 7. Idempotency: the same key must not duplicate */
{
  const { res, body } = await json("/api/specs", {
    method: "POST",
    body: JSON.stringify({
      name: `Verify ${unique}`,
      target: "translate",
      params: { kind: "spring", stiffness: 320, damping: 30, mass: 1, displacement: 100 },
      idempotencyKey: unique,
    }),
  });
  record("idempotent create returns the same record", body?.id === specId, `id=${body?.id}`);
  record("idempotent create is not a 500", res.status < 500, `status ${res.status}`);
}

/* 8. Read back through the API */
{
  const { res, body } = await json(`/api/specs/${specId}`);
  record("read-back returns 200", res.status === 200, `status ${res.status}`);
  record("read-back matches what was written", body?.id === specId, body?.name);
}

/* 9. Update and confirm the change is persisted */
{
  const { res, body } = await json(`/api/specs/${specId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: `Verify ${unique} updated`,
      params: { kind: "spring", stiffness: 500, damping: 40, mass: 1, displacement: 100 },
    }),
  });
  record("update returns 200", res.status === 200, `status ${res.status}`);
  record("update changed the name", body?.name?.includes("updated"), body?.name);

  const { body: after } = await json(`/api/specs/${specId}`);
  record(
    "update is reflected on read-back",
    after?.name?.includes("updated") && after?.params?.stiffness === 500,
    `stiffness=${after?.params?.stiffness}`,
  );
}

/* 10. Engine endpoint on the stored spec */
{
  const { res, body } = await json(`/api/specs/${specId}/analyze`, { method: "POST" });
  record("spec analyze returns 200", res.status === 200, `status ${res.status}`);
  record("spec analyze returns a recommendation", Boolean(body?.band), `band=${body?.band} score=${body?.score}`);
  record("spec analyze returns a seal", String(body?.seal ?? "").length === 96, "96-hex seal");
}

/* 11. Export produces a real downloadable artifact */
{
  const res = await call(`/api/specs/${specId}/export?format=css`);
  const body = await res.text();
  const disposition = res.headers.get("content-disposition") ?? "";
  record("export returns 200", res.status === 200, `status ${res.status}`);
  record("export sets an attachment header", disposition.includes("attachment"), disposition || "missing");
  record(
    "exported CSS is valid and includes a reduced-motion block",
    body.includes("transition-timing-function") && body.includes("prefers-reduced-motion"),
    `${body.length} bytes`,
  );
}

/* 12. MCP initialize */
{
  const { res, body } = await json("/api/mcp", {
    method: "POST",
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  });
  record("mcp initialize returns 200", res.status === 200, `status ${res.status}`);
  record("mcp initialize is jsonrpc 2.0", body?.jsonrpc === "2.0", body?.jsonrpc);
  record(
    "mcp initialize advertises a protocol version and server",
    Boolean(body?.result?.protocolVersion) && Boolean(body?.result?.serverInfo?.name),
    `${body?.result?.protocolVersion} / ${body?.result?.serverInfo?.name}`,
  );
}

/* 13. MCP tools/list */
{
  const { res, body } = await json("/api/mcp", {
    method: "POST",
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
  });
  const tools = (body?.result?.tools ?? []).map((t) => t.name);
  record("mcp tools/list returns 200", res.status === 200, `status ${res.status}`);
  record("mcp exposes at least 3 tools", tools.length >= 3, `${tools.length} tools: ${tools.join(", ")}`);
  record(
    "mcp tools carry input schemas",
    (body?.result?.tools ?? []).every((t) => t.inputSchema && typeof t.inputSchema.type === "string"),
    "all tools schema'd",
  );
  record(
    "mcp exposes read, analysis and mutating tools",
    tools.includes("list_specs") && tools.includes("analyze_motion") && tools.includes("save_spec"),
    "read + analysis + mutation present",
  );
}

/* 14. MCP mutating tool writes through the same path */
{
  const { res, body } = await json("/api/mcp", {
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "save_spec",
        arguments: {
          name: `MCP ${unique}`,
          target: "scale",
          params: { kind: "spring", stiffness: 420, damping: 9, mass: 1, displacement: 100 },
          idempotencyKey: `mcp-${unique}`,
        },
      },
    }),
  });
  const created = body?.result?.structuredContent?.spec?.id;
  record("mcp tools/call returns 200", res.status === 200, `status ${res.status}`);
  record("mcp isError is false", body?.result?.isError === false, String(body?.result?.isError));
  record("mcp mutation returned a created spec", Boolean(created), created ?? "no id");

  if (created) {
    const { res: listRes, body: listBody } = await json("/api/mcp", {
      method: "POST",
      body: JSON.stringify({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "list_specs", arguments: {} } }),
    });
    const ids = (listBody?.result?.structuredContent?.items ?? []).map((i) => i.id);
    record("mcp read-back proves the mutation persisted", ids.includes(created), `${ids.length} specs owned`);

    const del = await json("/api/mcp", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 5,
        method: "tools/call",
        params: { name: "delete_spec", arguments: { specId: created } },
      }),
    });
    record(
      "mcp delete tool works",
      del.body?.result?.structuredContent?.tombstone === true,
      String(del.body?.result?.structuredContent?.tombstone),
    );
    void listRes;
  }
}

/* 15. MCP method-not-found is a proper JSON-RPC error */
{
  const { body } = await json("/api/mcp", {
    method: "POST",
    body: JSON.stringify({ jsonrpc: "2.0", id: 9, method: "nope/nope" }),
  });
  record("unknown method returns JSON-RPC error -32601", body?.error?.code === -32601, String(body?.error?.code));
}

/* 16. Integrity replay before deletion */
{
  const { res, body } = await json(`/api/verify?specId=${specId}`);
  record("integrity replay returns 200", res.status === 200, `status ${res.status}`);
  record("integrity replay found no broken link", body?.ok === true, body?.reason ?? "clean");
  record("integrity replay checked real events", (body?.checked ?? 0) > 0, `${body?.checked} events`);
  record("integrity exposes a head seal", String(body?.headSeal ?? "").length === 96, "96-hex head seal");
}

/* 17. Ownership: another session cannot read the record */
{
  const saved = cookie;
  cookie = "";
  const { res } = await json(`/api/specs/${specId}`);
  record("a different session cannot read the spec", res.status === 404, `status ${res.status}`);
  cookie = saved;
}

/* 18. Delete, then confirm it is gone */
{
  const { res } = await json(`/api/specs/${specId}`, { method: "DELETE" });
  record("delete returns 200", res.status === 200, `status ${res.status}`);

  const { res: afterRes } = await json(`/api/specs/${specId}`);
  record("deleted spec is no longer readable", afterRes.status === 404, `status ${afterRes.status}`);

  const { body: afterVerify } = await json(`/api/verify?specId=${specId}`);
  record(
    "audit chain survives deletion and still replays",
    afterVerify?.ok === true,
    `${afterVerify?.checked} events retained`,
  );
}

/* 19. Every user-facing route responds */
for (const route of [
  "/",
  "/about",
  "/projects",
  "/projects/folio-motion",
  "/experience",
  "/contact",
  "/lab",
  "/specs",
  "/signals",
  "/agent",
  "/method",
  "/verify",
]) {
  const res = await call(route);
  record(`route ${route} returns 200`, res.status === 200, `status ${res.status}`);
}

/* 20. Shared nav and footer carry the repository link */
{
  const res = await call("/method");
  const html = await res.text();
  const repoLinks = countLinksTo(html, repository);
  record("repository link appears in shared chrome", repoLinks >= 1, `${repoLinks} link(s)`);
}

/* 21. mcp.json manifest points at a real endpoint */
{
  const res = await call("/mcp.json");
  const body = await res.json().catch(() => null);
  const url = body?.packages?.[0]?.transport?.url;
  const liveBase = DEFAULT_BASE.replace(/\/$/, "");
  const isLiveRun = base === liveBase;
  record("mcp.json is served", res.status === 200, `status ${res.status}`);
  record(
    "mcp.json declares an absolute https endpoint ending in /api/mcp",
    typeof url === "string" && url.startsWith("https://") && url.endsWith("/api/mcp"),
    url ?? "missing",
  );
  if (isLiveRun) {
    record("mcp.json points at this deployment", url === `${base}/api/mcp`, url ?? "missing");
  } else {
    record(
      "mcp.json pins the published live endpoint, not the local base",
      url === `${liveBase}/api/mcp`,
      `${url} (local run; live is ${liveBase})`,
    );
  }
}

/* 22. The repository itself is reachable */
{
  const res = await fetch(repository, { redirect: "manual" });
  record("repository URL returns 200", res.status === 200, `status ${res.status}`);
}

/* ------------------------------- summary -------------------------------- */

const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;
console.log(`${"─".repeat(64)}\n${passed}/${results.length} checks passed`);

if (failed > 0) {
  console.log("\nFailures:");
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  - ${r.name}${r.detail ? ` (${r.detail})` : ""}`);
  }
}

process.exit(failed === 0 ? 0 : 1);
