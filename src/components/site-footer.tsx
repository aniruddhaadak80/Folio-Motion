import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { GitHubMark } from "@/components/github-mark";
import { ENGINE_VERSION } from "@/lib/engine";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-24 border-t border-ink/12 bg-paper-2/60">
      <div aria-hidden className="filmstrip h-[6px] w-full opacity-30" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-display text-lg font-semibold">Folio Motion</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-2">
              A motion-physics lab for the browser. Every number this site shows is measured by
              numerically integrating the spring equation, never estimated.
            </p>
            <a
              href={siteConfig.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-bench mt-5"
              aria-label="View the Folio Motion source on GitHub (opens in a new tab)"
            >
              <GitHubMark />
              View source
            </a>
          </div>

          <nav aria-label="Footer">
            <p className="label">Lab</p>
            <ul className="mt-3 space-y-2">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-mono text-xs text-ink-2 transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="label">Elsewhere</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={siteConfig.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-xs text-ink-2 transition-colors hover:text-ink"
                >
                  <GitHubMark /> GitHub
                </a>
              </li>
              <li>
                <a
                  href={`${siteConfig.repository}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-ink-2 transition-colors hover:text-ink"
                >
                  Issues
                </a>
              </li>
              <li>
                <a
                  href={`${siteConfig.repository}/blob/main/CONTRIBUTING.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-ink-2 transition-colors hover:text-ink"
                >
                  Contributing
                </a>
              </li>
              <li>
                <Link href="/agent" className="font-mono text-xs text-ink-2 transition-colors hover:text-ink">
                  Agent API
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink/12 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono text-[10px] uppercase tracking-widest text-ink-3">
            © {year} {siteConfig.author} · {siteConfig.license} · engine {ENGINE_VERSION}
          </p>
          <p className="mono text-[10px] uppercase tracking-widest text-ink-3">
            Motion scores are design aids, not accessibility guarantees
          </p>
        </div>
      </div>
    </footer>
  );
}
