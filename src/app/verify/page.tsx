import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { IntegrityPanel } from "@/components/integrity-panel";

export const metadata: Metadata = pageMetadata({
  title: "Integrity",
  description: "Replay the append-only SHA-384 audit chain and find the first broken link.",
  path: "/verify",
});

export default function VerifyPage() {
  return <IntegrityPanel />;
}
