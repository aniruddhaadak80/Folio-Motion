import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repository";
import { replayAllChains, replayChain } from "@/lib/integrity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Replay the append-only audit chain and report the first broken link.
 *
 * Scoped (`?specId=`) it verifies one per-entity chain. Unscoped it verifies
 * every chain independently, since each spec has its own genesis.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const specId = url.searchParams.get("specId");

  try {
    const repo = await getRepository();
    await repo.init();
    const events = await repo.listAudit(specId ?? undefined);

    if (specId) {
      const replay = replayChain(events);
      return NextResponse.json(
        {
          ok: replay.ok,
          scope: specId,
          chains: 1,
          events: replay.checked,
          checked: replay.checked,
          firstBrokenAt: replay.firstBrokenAt,
          firstBrokenId: replay.firstBrokenId,
          reason: replay.reason,
          headSeal: await repo.headSeal(specId),
          chain: events.map((e) => ({
            id: e.id,
            specId: e.specId,
            action: e.action,
            createdAt: e.createdAt,
            seal: e.seal,
            prevSeal: e.prevSeal,
          })),
        },
        { status: replay.ok ? 200 : 409, headers: { "Cache-Control": "no-store" } },
      );
    }

    const grouped = replayAllChains(events);
    return NextResponse.json(
      {
        ok: grouped.ok,
        scope: "global",
        chains: grouped.chains,
        events: grouped.events,
        checked: grouped.events,
        brokenChains: grouped.brokenChains,
        firstBrokenAt: grouped.brokenChains[0]?.firstBrokenAt ?? null,
        firstBrokenId: grouped.brokenChains[0]?.firstBrokenId ?? null,
        reason: grouped.brokenChains[0]?.reason ?? null,
        headSeal: grouped.headSeal,
      },
      { status: grouped.ok ? 200 : 409, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        reason: err instanceof Error ? err.message : "replay failed",
        checked: 0,
      },
      { status: 503 },
    );
  }
}
