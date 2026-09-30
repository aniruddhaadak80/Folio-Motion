"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Send, Check, AlertCircle, Mail, ExternalLink } from "lucide-react";
import { personal, sectionIds, socials } from "@/config/portfolio";
import { Reveal, SectionHeading, BENCH_SPRING } from "@/components/motion-primitives";
import { GitHubMark } from "@/components/github-mark";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string; fallback?: string };

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function Contact() {
  const [values, setValues] = useState({ name: "", email: "", message: "", company: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const reduced = useReducedMotion();

  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
    if (errors[key as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  /** Client-side checks mirror the server schema, so the first pass is instant. */
  const validate = (): boolean => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Please add your name.";
    else if (values.name.trim().length > 80) next.name = "That name is too long.";

    if (!values.email.trim()) next.email = "Please add your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next.email = "That doesn't look like an email address.";

    if (values.message.trim().length < 10) next.message = "A little more detail, please.";
    else if (values.message.trim().length > 4000) next.message = "Please keep it under 4000 characters.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: { message: string; details?: { fallback?: string } };
      };

      if (!res.ok || !json.ok) {
        setStatus({
          kind: "error",
          message: json.error?.message ?? `Something went wrong (${res.status}).`,
          fallback: json.error?.details?.fallback,
        });
        return;
      }

      setStatus({ kind: "sent" });
      setValues({ name: "", email: "", message: "", company: "" });
    } catch {
      setStatus({
        kind: "error",
        message: "Could not reach the server. The form needs a working backend.",
        fallback: `mailto:${personal.email}`,
      });
    }
  };

  const inputClass = (key: keyof Errors) =>
    `field mt-1.5 ${errors[key] ? "border-[var(--color-ruby)]" : ""}`;

  return (
    <section
      id={sectionIds.contact}
      className="border-b border-[var(--color-line)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* ------------------------------------------------------- pitch */}
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Let's talk about your project"
              lede="Tell me what you're building and what's in the way. I reply to everything, usually within a day."
            />

            <Reveal delay={0.12}>
              <div className="mt-8 space-y-3">
                <a
                  href={`mailto:${personal.email}`}
                  className="panel flex items-center gap-3 p-4 transition-colors hover:border-[var(--color-ink)]"
                >
                  <Mail size={16} className="shrink-0 text-[var(--color-signal-2)]" />
                  <span className="min-w-0">
                    <span className="label block">Email</span>
                    <span className="mono block truncate text-sm">{personal.email}</span>
                  </span>
                </a>

                <ul className="flex flex-wrap gap-2">
                  {socials
                    .filter((s) => s.href.startsWith("http"))
                    .map((social) => (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost btn-sm"
                        >
                          {social.label === "GitHub" ? <GitHubMark size={13} /> : null}
                          {social.label}
                          <ExternalLink size={11} />
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* -------------------------------------------------------- form */}
          <Reveal delay={0.1}>
            <div className="panel panel-raised p-6 sm:p-8">
              {status.kind === "sent" ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={BENCH_SPRING}
                  className="flex min-h-[22rem] flex-col items-center justify-center text-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center border border-[var(--color-signal-2)] bg-[color-mix(in_oklab,var(--color-signal)_24%,transparent)]">
                    <Check size={22} className="text-[var(--color-ink)]" />
                  </span>
                  <h3 className="mt-5 text-2xl">Message sent</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-ink-2)]">
                    Thanks for getting in touch. I&apos;ll reply to the address you gave me.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus({ kind: "idle" })}
                    className="btn-ghost mt-6"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <p className="label">Send a message</p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label htmlFor="contact-name" className="label">
                        Your name
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        autoComplete="name"
                        className={inputClass("name")}
                        value={values.name}
                        onChange={set("name")}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "contact-name-error" : undefined}
                      />
                      {errors.name && (
                        <p id="contact-name-error" className="mt-1 font-mono text-[11px] text-[var(--color-ruby)]">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="label">
                        Your email
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={inputClass("email")}
                        value={values.email}
                        onChange={set("email")}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "contact-email-error" : undefined}
                      />
                      {errors.email && (
                        <p id="contact-email-error" className="mt-1 font-mono text-[11px] text-[var(--color-ruby)]">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="label">
                        What are you building?
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        className={`${inputClass("message")} resize-y`}
                        value={values.message}
                        onChange={set("message")}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? "contact-message-error" : undefined}
                        placeholder="A sentence or two about the project and the timeline."
                      />
                      {errors.message && (
                        <p id="contact-message-error" className="mt-1 font-mono text-[11px] text-[var(--color-ruby)]">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Honeypot. Hidden from people, tempting to bots. */}
                    <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
                      <label htmlFor="contact-company">Company</label>
                      <input
                        id="contact-company"
                        name="company"
                        tabIndex={-1}
                        autoComplete="off"
                        value={values.company}
                        onChange={set("company")}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="btn-bench"
                      disabled={status.kind === "sending"}
                    >
                      {status.kind === "sending" ? "Sending…" : "Send message"}
                      <Send size={13} />
                    </button>
                    <p className="mono text-[10px] uppercase tracking-widest text-[var(--color-ink-3)]">
                      No newsletter, no tracking
                    </p>
                  </div>

                  {/* Honest failure state: says what happened and offers a
                      working alternative, rather than a dead end. */}
                  {status.kind === "error" && (
                    <motion.div
                      initial={reduced ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="mt-4 border border-[color-mix(in_oklab,var(--color-ruby)_45%,transparent)] bg-[color-mix(in_oklab,var(--color-ruby)_7%,transparent)] p-3"
                    >
                      <p className="flex items-start gap-2 font-mono text-[11px] text-[var(--color-ruby)]">
                        <AlertCircle size={13} className="mt-px shrink-0" />
                        <span>{status.message}</span>
                      </p>
                      {(status.fallback ?? `mailto:${personal.email}`) && (
                        <a
                          href={status.fallback ?? `mailto:${personal.email}`}
                          className="mono mt-2 inline-block text-[11px] text-[var(--color-ink)] underline decoration-[var(--color-signal-2)] underline-offset-4"
                        >
                          Email me directly instead →
                        </a>
                      )}
                    </motion.div>
                  )}
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
