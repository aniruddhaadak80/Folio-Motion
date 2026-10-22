"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { navigation, seo, personal } from "@/config/portfolio";
import { GitHubMark, Wordmark } from "@/components/github-mark";
import { ThemeSwitcher } from "@/components/theme-switcher";

/** Everything a keyboard can reach inside the mobile header. */
const FOCUSABLE = 'a[href], button:not([disabled])';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close the menu on navigation, adjusted during render rather than in an
  // effect so there is no extra commit.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Give the focus back to the button that opened the menu, so a
      // keyboard user never loses their place on the page.
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Move focus into the menu when it opens, so the next Tab lands on the
  // first link rather than somewhere further down the page.
  useEffect(() => {
    if (!open) return;
    const first = mobileNavRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }, [open]);

  /**
   * Keep Tab inside the open menu.
   *
   * The mobile menu drops over the page, so tabbing out of it leaves the
   * keyboard user on content they cannot see. The tab stop is the menu
   * button plus everything inside the menu itself.
   */
  const onHeaderKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!open || event.key !== "Tab") return;
    const targets = [
      ...Array.from(mobileBarRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
      ...Array.from(mobileNavRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
    ].filter((node) => node.tabIndex >= 0);
    if (targets.length === 0) return;
    const first = targets[0]!;
    const last = targets[targets.length - 1]!;
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      onKeyDown={onHeaderKeyDown}
      className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper)_86%,transparent)] backdrop-blur-md"
    >
      <div aria-hidden className="filmstrip h-[5px] w-full opacity-40" />

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2" aria-label={`${personal.name} — home`}>
          <Wordmark />
          <span className="mono hidden text-[10px] uppercase tracking-widest text-[var(--color-ink-3)] sm:inline">
            template
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`relative px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                isActive(item.href)
                  ? "text-[var(--color-ink)]"
                  : "text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 -bottom-px h-[2px] bg-[var(--color-signal-2)]"
                />
              )}
            </Link>
          ))}

          <div className="ml-2 flex items-center gap-2">
            <ThemeSwitcher />
            <a
              href={seo.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-sm"
              aria-label="Star this template on GitHub (opens in a new tab)"
            >
              <GitHubMark size={14} />
              <span className="hidden lg:inline">Star</span>
            </a>
          </div>
        </nav>

        <div ref={mobileBarRef} className="flex items-center gap-2 md:hidden">
          <ThemeSwitcher />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center border border-[var(--color-line)]"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" ref={mobileNavRef} className="border-t border-[var(--color-line)] md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-1 sm:px-6" aria-label="Mobile">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="flex items-center justify-between border-b border-[var(--color-line-soft)] py-3 font-mono text-[11px] uppercase tracking-widest last:border-0"
              >
                <span className={isActive(item.href) ? "text-[var(--color-ink)]" : "text-[var(--color-ink-2)]"}>
                  {item.label}
                </span>
                <span aria-hidden className="text-[var(--color-ink-3)]">
                  →
                </span>
              </Link>
            ))}
            <a
              href={seo.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-3 font-mono text-[11px] uppercase tracking-widest text-[var(--color-ink-2)]"
            >
              <GitHubMark size={14} /> Star on GitHub
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
