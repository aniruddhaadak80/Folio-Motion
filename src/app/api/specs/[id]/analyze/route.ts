import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OWNER_COOKIE, OWNER_COOKIE_OPTIONS, resolveSession } from "@/lib/session";
import { analyzeSpec, statusForError } from "@/lib/service";
import type { ApiError } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { ownerId, isNew } = await resolveSession();
  const result = await analyzeSpec(ownerId, id);

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
