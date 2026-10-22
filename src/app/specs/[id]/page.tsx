import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SpecDetail } from "@/components/spec-detail";

export const metadata: Metadata = pageMetadata({
  title: "Spec detail",
  description: "Measured curve, explainable score, provenance seal and production export for one motion spec.",
  path: "/specs/[id]",
});

export default async function SpecPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SpecDetail id={id} />;
}
