import type { Metadata } from "next";
import { Lab } from "@/components/lab";

export const metadata: Metadata = {
  title: "Motion lab",
  description:
    "Tune spring and bezier parameters and watch settle time, overshoot and onset recompute from a live numerical integration.",
  alternates: { canonical: "/lab" },
};

export default function LabPage() {
  return <Lab />;
}
