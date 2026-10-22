import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Lab } from "@/components/lab";

export const metadata: Metadata = pageMetadata({
  title: "Motion lab",
  description:
    "Tune spring and bezier parameters and watch settle time, overshoot and onset recompute from a live numerical integration.",
  path: "/lab",
});

export default function LabPage() {
  return <Lab />;
}
