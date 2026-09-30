"use client";

/**
 * Project filters.
 *
 * Deliberately tiny and client-side. The cards themselves are rendered on the
 * server (see the page), so the static HTML contains real content for crawlers
 * and no-JS visitors. This component only changes the URL.
 */

import { useRouter, useSearchParams } from "next/navigation";

export function ProjectFilters({
  tags,
  counts,
  active,
  total,
}: {
  tags: string[];
  counts: Record<string, number>;
  active: string;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const setTag = (tag: string) => {
    const next = new URLSearchParams(params.toString());
    if (tag === "all") next.delete("tag");
    else next.set("tag", tag);
    const qs = next.toString();
    // refresh() re-runs the server component, so the cards match the URL
    // without this component needing to own them.
    router.replace(qs ? `/projects?${qs}` : "/projects", { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by technology">
      {tags.map((tag) => {
        const isActive = active === tag;
        const count = tag === "all" ? total : (counts[tag] ?? 0);
        if (count === 0) return null;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => setTag(tag)}
            aria-pressed={isActive}
            className={`chip transition-colors ${
              isActive
                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
                : "hover:border-[var(--color-ink)]"
            }`}
          >
            {tag}
            <span className={isActive ? "opacity-60" : "text-[var(--color-ink-3)]"}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
