import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OWNER_COOKIE, OWNER_COOKIE_OPTIONS, resolveSession } from "@/lib/session";
import { exportSpec, statusForError, type ExportFormat } from "@/lib/service";
import type { ApiError } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

const FORMATS: readonly ExportFormat[] = ["css", "framer", "svg", "report"];

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const url = new URL(request.url);
  const requested = url.searchParams.get("format") ?? "report";
  if (!FORMATS.includes(requested as ExportFormat)) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: `format must be one of: ${FORMATS.join(", ")}` } },
      { status: 400 },
    );
  }

  const { ownerId, isNew } = await resolveSession();
  const result = await exportSpec(ownerId, id, requested as ExportFormat);

  if ("error" in result) {
    const err = result as ApiError;
    const res = NextResponse.json(err, { status: statusForError(err.error.code) });
    if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
    return res;
  }

  const res = new NextResponse(result.file.body, {
    status: 200,
    headers: {
      "Content-Type": result.file.mime,
      "Content-Disposition": `attachment; filename="${result.file.filename}"`,
      "Cache-Control": "no-store",
      "X-Motion-Score": String(result.analysis.score),
      "X-Motion-Seal": result.analysis.seal,
    },
  });
  if (isNew) (await cookies()).set(OWNER_COOKIE, ownerId, OWNER_COOKIE_OPTIONS);
  return res;
}
