import type { Metadata } from "next";
import { Suspense } from "react";
import { SpecsLibrary } from "@/components/specs-library";

export const metadata: Metadata = {
  title: "Saved specs",
  description: "Every motion spec you have saved in this session, with live scores and comparison.",
  alternates: { canonical: "/specs" },
};

export default function SpecsPage() {
  return (
    // useSearchParams requires a Suspense boundary during static rendering.
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="panel h-72 animate-pulse bg-ink/[0.03]" aria-hidden />
          <p className="sr-only">Loading specs…</p>
        </div>
      }
    >
      <SpecsLibrary />
    </Suspense>
  );
}
