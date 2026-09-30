import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { navigation } from "@/config/portfolio";

/** A real 404, not a dead end: it offers a way back. */
export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="label">404</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">Nothing on this bench</h1>
      <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-[var(--color-ink-2)]">
        That page does not exist. It may have moved, or the link may have been mistyped.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn-bench">
          <ArrowLeft size={14} /> Back home
        </Link>
        {navigation.slice(1, 4).map((item) => (
          <Link key={item.href} href={item.href} className="btn-ghost">
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
