import type { Metadata } from "next";
import { IntegrityPanel } from "@/components/integrity-panel";

export const metadata: Metadata = {
  title: "Integrity",
  description: "Replay the append-only SHA-384 audit chain and find the first broken link.",
  alternates: { canonical: "/verify" },
};

export default function VerifyPage() {
  return <IntegrityPanel />;
}
