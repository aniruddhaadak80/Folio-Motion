import type { Metadata } from "next";
import { Suspense } from "react";
import { projects } from "@/config/portfolio";
import { PageHeader } from "@/components/page-header";
import { ProjectsIndex } from "@/components/projects-index";

export const metadata: Metadata = {
  title: "Projects",
  description: `Selected work by ${projects.length > 0 ? "me" : "the author"}, with the hard parts written down.`,
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Work, with the hard parts written down"
        lede="Every case study answers the question a client actually asks: what was difficult, and what did you do about it?"
      />
      {/* useSearchParams needs a Suspense boundary during static rendering. */}
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="panel h-64 animate-pulse bg-[var(--color-ink)]/[0.03]" aria-hidden />
            <p className="sr-only">Loading projects…</p>
          </div>
        }
      >
        <ProjectsIndex />
      </Suspense>
    </>
  );
}
