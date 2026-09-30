"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";
import { GitHubMark } from "@/components/github-mark";
import { useReducedMotion } from "framer-motion";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  // Close the mobile menu on navigation, adjusted during render rather than
  // in an effect so there is no extra commit.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/12 bg-paper/85 backdrop-blur-md">
      {/* Film-strip rail: the timeline metaphor, present on every page. */}
      <div aria-hidden className="filmstrip h-[6px] w-full opacity-40" />

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2"
          aria-label={`${siteConfig.name} home`}
        >
          <span className="font-display text-base font-semibold tracking-tight">
            Folio<span className="ink-signal">/</span>Motion
          </span>
          <span className="mono hidden text-[10px] uppercase tracking-widest text-ink-3 sm:inline">
            v2.0
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`relative px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                isActive(item.href) ? "text-ink" : "text-ink-3 hover:text-ink"
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 -bottom-px h-[2px] bg-signal-2"
                  style={
                    reduced
                      ? undefined
                      : { animation: "fm-dash 400ms var(--ease-out-expo) both" }
                  }
                />
              )}
            </Link>
          ))}
          <a
            href={siteConfig.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost ml-2 !px-3 !py-1.5 !text-[11px]"
            aria-label="Star Folio Motion on GitHub (opens in a new tab)"
          >
            <GitHubMark />
            <span className="hidden lg:inline">Star</span>
          </a>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center border border-ink/25 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className="relative block h-3 w-4">
            <span
              className="absolute left-0 block h-px w-4 bg-ink transition-transform duration-200"
              style={{ top: open ? 6 : 0, transform: open ? "rotate(45deg)" : "none" }}
            />
            <span
              className="absolute left-0 block h-px w-4 bg-ink transition-opacity duration-200"
              style={{ top: 6, opacity: open ? 0 : 1 }}
            />
            <span
              className="absolute left-0 block h-px w-4 bg-ink transition-transform duration-200"
              style={{ top: open ? 6 : 12, transform: open ? "rotate(-45deg)" : "none" }}
            />
          </span>
        </button>
      </div>

      {/* Mobile navigation panel */}
      {open && (
        <div id="mobile-nav" className="border-t border-ink/12 bg-paper md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6" aria-label="Mobile">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="flex items-center justify-between border-b border-ink/8 py-3 font-mono text-xs uppercase tracking-widest last:border-0"
              >
                <span className={isActive(item.href) ? "text-ink" : "text-ink-2"}>{item.label}</span>
                <span aria-hidden className="text-ink-3">→</span>
              </Link>
            ))}
            <a
              href={siteConfig.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-3 font-mono text-xs uppercase tracking-widest text-ink-2"
            >
              <GitHubMark />
              View source on GitHub
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
