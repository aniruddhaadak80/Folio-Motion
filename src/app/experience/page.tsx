import type { Metadata } from "next";
import { experience } from "@/config/portfolio";
import { PageHeader } from "@/components/page-header";
import { Experience } from "@/components/sections/experience";

export const metadata: Metadata = {
  title: "Experience",
  description: `Roles and the work behind them — ${experience.length} positions, plus what I'd tell someone considering hiring me about each.`,
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title="Where I've worked"
        lede="Roles, the work behind them, and the part I'd say out loud in an interview."
      />
      <Experience withHeading={false} />
    </>
  );
}
