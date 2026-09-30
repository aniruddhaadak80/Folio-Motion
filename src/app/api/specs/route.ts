import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OWNER_COOKIE, OWNER_COOKIE_OPTIONS, resolveSession } from "@/lib/session";
import { createSpec, listSpecs, statusForError } from "@/lib/service";
import type { ApiError } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? "20");
  const offsetRaw = Number(url.searchParams.get("offset") ?? "0");
  const limit = Number.isFinite(limitRaw) ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limitRaw))) : 20;
  const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.trunc(offsetRaw)) : 0;

  const { ownerId, isNew } = await resolveSession();
  const result = await listSpecs(ownerId, limit, offset);

  if ("error" in result) {
    const err = result as ApiError;
    return NextResponse.json(err, { status: statusForError(err.error.code) });
  }

  const res = NextResponse.json({
    items: result.items,
    total: result.total,
    limit,
    offset,
  });

  if (isNew) {
    const jar = await cookies();
    jar.set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
  }
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(request: Request) {
  const { ownerId, isNew } = await resolveSession();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    const res = NextResponse.json(
      { error: { code: "invalid_request", message: "Request body must be valid JSON." } },
      { status: 400 },
    );
    if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
    return res;
  }

  const result = await createSpec(ownerId, payload);

  if ("error" in result) {
    const err = result as ApiError;
    const res = NextResponse.json(err, { status: statusForError(err.error.code) });
    if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
    return res;
  }

  const res = NextResponse.json(result, { status: 201 });
  if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
