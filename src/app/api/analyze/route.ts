import { NextResponse } from "next/server";
import { analyzeDraft, statusForError } from "@/lib/service";
import type { ApiError } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stateless analysis for the live playground. Nothing is persisted here: this
 * exists so the drag interaction can be scored on every pointer move without
 * writing to the database sixty times a second.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_request", message: "Body must be valid JSON." } }, { status: 400 });
  }

  const body = payload as { params?: unknown; target?: unknown };
  const result = analyzeDraft(body.params, body.target);
  if ("error" in result) {
    const err = result as ApiError;
    return NextResponse.json(err, { status: statusForError(err.error.code) });
  }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
