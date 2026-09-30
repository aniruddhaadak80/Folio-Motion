import type { Metadata } from "next";
import { personal } from "@/config/portfolio";
import { PageHeader } from "@/components/page-header";
import { Contact } from "@/components/sections/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${personal.name}. I reply to everything, usually within a day.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk"
        lede="Tell me what you're building and what's in the way. Freelance, contract or a full-time role — all fine."
      />
      <Contact />
    </>
  );
}
