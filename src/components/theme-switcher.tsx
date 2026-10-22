"use client";

/**
 * Theme switcher.
 *
 * Writes `data-theme` on <html> and remembers the choice. The inline script in
 * layout.tsx applies it before first paint, so there is no flash of the wrong
 * palette on reload.
 *
 * The three palettes are one control, so they are a toolbar with a roving
 * tab stop: Tab reaches the group once and the arrow keys move between the
 * palettes. See `src/lib/keyboard.ts` for the shared key handling.
 *
 * The buttons keep their `button` role rather than becoming radios. The
 * browser tests drive the switcher by `role="button"`, and a toolbar of
 * pressed buttons is the documented pattern for a row of toggles.
 *
 * To add a palette: add a `[data-theme="name"]` block to globals.css, then add
 * it to THEMES below.
 */

import { useEffect, useRef, useState } from "react";
import { nextRadioIndex, radioTabIndex } from "@/lib/keyboard";

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
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

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

  /**
   * Arrow keys move between the palettes and pick as they go, so the whole
   * switcher is one tab stop. The key event is swallowed so the page does not
   * scroll sideways at the same time.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextRadioIndex(event.key, index, THEMES.length);
    if (next === null) return;
    event.preventDefault();
    const target = THEMES[next];
    if (!target) return;
    choose(target.id);
    buttonsRef.current[next]?.focus();
  };

  return (
    <div
      role="toolbar"
      aria-label="Colour theme"
      className="flex items-center gap-1 border border-[var(--color-line)] p-0.5"
    >
      {THEMES.map((t, index) => {
        const active = mounted && theme === t.id;
        return (
          <button
            key={t.id}
            ref={(node) => {
              buttonsRef.current[index] = node;
            }}
            type="button"
            aria-pressed={active}
            tabIndex={radioTabIndex(theme === t.id)}
            onClick={() => choose(t.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
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
