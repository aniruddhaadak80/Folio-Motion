import { NextResponse } from "next/server";
import { z } from "zod";
import { checkWriteBudget, statusForError } from "@/lib/service";
import type { ApiError } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Contact endpoint.
 *
 * With RESEND_API_KEY set it sends a real email through the Resend HTTP API.
 * Without it, it fails with a clear 503 and a message the UI turns into an
 * honest fallback with a mailto link — it never pretends a message was sent.
 *
 * To use a different provider, replace sendEmail() below. Nothing else needs
 * to change.
 */

const NAME_MAX = 80;
const EMAIL_MAX = 200;
const MESSAGE_MAX = 4000;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(NAME_MAX, "That name is too long."),
  email: z.string().trim().min(1, "Please add your email.").max(EMAIL_MAX, "That email is too long.").email("That doesn't look like an email address."),
  message: z.string().trim().min(10, "A little more detail, please — at least 10 characters.").max(MESSAGE_MAX, "Please keep it under 4000 characters."),
  /** Honeypot: a real person never fills a field they cannot see. */
  company: z.string().max(0, "Rejected.").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function sendEmail(input: ContactInput, to: string, fromName: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not configured" };

  const from = process.env.CONTACT_FROM_EMAIL ?? `Portfolio <onboarding@resend.dev>`;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: `Portfolio enquiry from ${input.name}`,
        text: [
          `Name:    ${input.name}`,
          `Email:   ${input.email}`,
          "",
          input.message,
          "",
          `— sent from ${fromName}`,
        ].join("\n"),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      // Never forward the provider's raw body: it can contain account details.
      return { ok: false, error: `Email provider responded ${res.status}. ${detail.slice(0, 120)}` };
    }

    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network failure" };
  }
}

export async function POST(request: Request) {
  const budget = checkWriteBudget("contact");
  if (budget) {
    const err = budget as ApiError;
    return NextResponse.json(err, { status: statusForError(err.error.code) });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Body must be valid JSON." } },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Please check the form.", details: parsed.error.issues } },
      { status: 400 },
    );
  }

  const { company: _honeypot, ...input } = parsed.data;

  // Imported lazily so the route still works if the config file is edited.
  const { personal } = await import("@/config/portfolio");

  const result = await sendEmail(input, personal.email, personal.name);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: {
          code: "internal",
          message: "Email delivery is not set up on this deployment.",
          details: {
            hint: "Set RESEND_API_KEY (and optionally CONTACT_FROM_EMAIL) to enable the form.",
            fallback: `mailto:${personal.email}`,
          },
        },
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { ok: true, id: result.id, message: "Sent. I'll reply to the address you gave me." },
    { status: 200 },
  );
}
