import Link from "next/link";
import { Mail, MapPin, Clock } from "lucide-react";
import { navigation, personal, seo, socials } from "@/config/portfolio";
import { GitHubMark } from "@/components/github-mark";
import { ENGINE_VERSION } from "@/lib/engine";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper-2)_70%,transparent)]">
      <div aria-hidden className="filmstrip h-[5px] w-full opacity-30" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Who + what this is */}
          <div>
            <p className="font-display text-lg font-semibold">{personal.name}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-[var(--color-ink-3)]">
              {personal.role}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-ink-2)]">
              {personal.tagline}
            </p>
            <a
              href={seo.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-bench mt-5"
              aria-label="View the source of this portfolio template on GitHub (opens in a new tab)"
            >
              <GitHubMark />
              View template source
            </a>
          </div>

          {/* Pages */}
          <nav aria-label="Footer pages">
            <p className="label">Pages</p>
            <ul className="mt-3 space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-mono text-xs text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Lab — the feature that makes this template different */}
          <nav aria-label="Footer lab">
            <p className="label">Lab</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/lab" className="font-mono text-xs text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-ink)]">
                  Motion lab
                </Link>
              </li>
              <li>
                <Link href="/method" className="font-mono text-xs text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-ink)]">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/agent" className="font-mono text-xs text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-ink)]">
                  Agent API
                </Link>
              </li>
              <li>
                <Link href="/verify" className="font-mono text-xs text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-ink)]">
                  Integrity
                </Link>
              </li>
            </ul>
          </nav>

          {/* Elsewhere + facts */}
          <div>
            <p className="label">Elsewhere</p>
            <ul className="mt-3 space-y-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    {...(social.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="font-mono text-xs text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="mt-4 space-y-1.5">
              <li className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-ink-3)]">
                <MapPin size={11} /> {personal.location}
              </li>
              <li className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-ink-3)]">
                <Clock size={11} /> {personal.timezone}
              </li>
              <li className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-ink-3)]">
                <Mail size={11} /> {personal.email}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--color-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono text-[10px] uppercase tracking-widest text-[var(--color-ink-3)]">
            © {year} {personal.name} · {seo.license} · template v2.0
          </p>
          <p className="mono text-[10px] uppercase tracking-widest text-[var(--color-ink-3)]">
            Motion engine {ENGINE_VERSION} · fork it, make it yours
          </p>
        </div>
      </div>
    </footer>
  );
}
