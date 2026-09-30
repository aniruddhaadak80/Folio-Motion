import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OWNER_COOKIE, OWNER_COOKIE_OPTIONS, resolveSession } from "@/lib/session";
import { deleteSpec, getSpec, statusForError, updateSpec } from "@/lib/service";
import type { ApiError } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

const ID_PATTERN = /^[0-9a-fA-F-]{8,64}$/;

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Malformed spec id." } }, { status: 400 });
  }
  const { ownerId, isNew } = await resolveSession();
  const result = await getSpec(ownerId, id);
  if ("error" in result) {
    const err = result as ApiError;
    const res = NextResponse.json(err, { status: statusForError(err.error.code) });
    if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
    return res;
  }
  const res = NextResponse.json(result);
  if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Malformed spec id." } }, { status: 400 });
  }
  const { ownerId, isNew } = await resolveSession();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    const res = NextResponse.json({ error: { code: "invalid_request", message: "Body must be valid JSON." } }, { status: 400 });
    if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
    return res;
  }

  const result = await updateSpec(ownerId, id, payload);
  if ("error" in result) {
    const err = result as ApiError;
    const res = NextResponse.json(err, { status: statusForError(err.error.code) });
    if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
    return res;
  }
  const res = NextResponse.json(result);
  if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Malformed spec id." } }, { status: 400 });
  }
  const { ownerId, isNew } = await resolveSession();
  const result = await deleteSpec(ownerId, id);
  if ("error" in result) {
    const err = result as ApiError;
    const res = NextResponse.json(err, { status: statusForError(err.error.code) });
    if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
    return res;
  }
  const res = NextResponse.json({ ...result, tombstone: true });
  if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
