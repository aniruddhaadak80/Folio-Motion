import { NextResponse } from "next/server";
import { getRepository, resolveDatabaseUrl, resolveSchema } from "@/lib/repository";
import { ENGINE_VERSION } from "@/lib/engine";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health check that actually exercises the configured persistence path.
 * A static `{ ok: true }` would be worthless here, so this runs a real query.
 */
export async function GET() {
  const startedAt = Date.now();
  const configured = Boolean(resolveDatabaseUrl());
  const adapter = configured ? "neon-postgres" : "pglite-embedded";

  if (process.env.NODE_ENV === "production" && !configured) {
    return NextResponse.json(
      {
        ok: false,
        engine: ENGINE_VERSION,
        store: {
          kind: adapter,
          ok: false,
          detail: "No DATABASE_URL or POSTGRES_URL is configured in production.",
        },
        repository: siteConfig.repository,
      },
      { status: 503 },
    );
  }

  try {
    const repo = await getRepository();
    await repo.init();
    const health = await repo.health();
    return NextResponse.json(
      {
        ok: health.ok,
        engine: ENGINE_VERSION,
        store: { kind: repo.kind, schema: resolveSchema(), ...health },
        specCount: await repo
          .listSpecs("__health__", 1, 0)
          .then((r) => r.total)
          .catch(() => -1),
        latencyMs: Date.now() - startedAt,
        repository: siteConfig.repository,
      },
      { status: health.ok ? 200 : 503 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        engine: ENGINE_VERSION,
        store: {
          kind: adapter,
          ok: false,
          detail: err instanceof Error ? err.message : "unknown error",
        },
        latencyMs: Date.now() - startedAt,
      },
      { status: 503 },
    );
  }
}
