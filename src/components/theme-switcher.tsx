"use client";

/**
 * Theme switcher.
 *
 * Writes `data-theme` on <html> and remembers the choice. The inline script in
 * layout.tsx applies it before first paint, so there is no flash of the wrong
 * palette on reload.
 *
 * To add a palette: add a `[data-theme="name"]` block to globals.css, then add
 * it to THEMES below.
 */

import { useEffect, useState } from "react";

export const THEMES = [
  { id: "bench", label: "Bench", swatch: ["#f4f1e8", "#241b2f", "#c8f542"] },
  { id: "ink", label: "Ink", swatch: ["#14111c", "#f2eefb", "#c8f542"] },
  { id: "paper", label: "Paper", swatch: ["#ffffff", "#0b0d10", "#4f46e5"] },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_STORAGE_KEY = "fm-theme";

/** The script that runs before paint. Kept as a string so it stays inline. */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var id = ${JSON.stringify(THEMES.map((t) => t.id))}.indexOf(stored) > -1 ? stored : "bench";
    document.documentElement.setAttribute("data-theme", id);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "bench");
  }
})();
`;

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>("bench");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // The inline script in layout.tsx has already set data-theme before paint.
    // Read it after a microtask so this effect performs no synchronous setState.
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      const current = (document.documentElement.getAttribute("data-theme") as ThemeId) || "bench";
      setTheme(current);
      setMounted(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const choose = (id: ThemeId) => {
    setTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* private mode: the theme still applies for this page view */
    }
  };

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="flex items-center gap-1 border border-[var(--color-line)] p-0.5"
    >
      {THEMES.map((t) => {
        const active = mounted && theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => choose(t.id)}
            aria-pressed={active}
            title={`${t.label} theme`}
            className="group relative flex h-7 w-7 items-center justify-center transition-transform hover:scale-110"
          >
            <span className="flex h-4 w-4 overflow-hidden border border-[var(--color-line)]">
              <span className="h-full flex-1" style={{ background: t.swatch[0] }} />
              <span className="h-full flex-1" style={{ background: t.swatch[1] }} />
              <span className="h-full flex-1" style={{ background: t.swatch[2] }} />
            </span>
            {active && (
              <span className="absolute inset-0 border border-[var(--color-ink)]" aria-hidden />
            )}
            <span className="sr-only">{t.label} theme</span>
          </button>
        );
      })}
    </div>
  );
}
