import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Consistent page banner, so every secondary page opens the same way. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--color-line)]">
      <div aria-hidden className="filmstrip h-1.5 w-full opacity-30" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Link
          href="/"
          className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={11} /> Home
        </Link>
        <p className="label mt-6 flex items-center gap-2">
          <span aria-hidden className="inline-block h-2 w-2 bg-[var(--color-signal)]" />
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
        {lede && (
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-ink-2)]">
            {lede}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
