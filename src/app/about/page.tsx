import type { Metadata } from "next";
import { personal } from "@/config/portfolio";
import { Services, Skills } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description: personal.shortBio,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="The longer version"
        lede={personal.shortBio}
      />

      {/* Full bio, using every paragraph the config provides. */}
      <section className="border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="prose-bench text-base">
            {personal.longBio.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-10 grid gap-px border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-3">
            {[
              { k: "Based in", v: personal.location },
              { k: "Time zone", v: personal.timezone },
              { k: "Status", v: personal.availableForWork ? personal.availableForWorkText : "Not looking" },
            ].map((item) => (
              <div key={item.k} className="bg-[var(--color-paper)] px-4 py-4">
                <dt className="label">{item.k}</dt>
                <dd className="mt-1 text-sm">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Services />
      <Skills />
      <Contact />
    </>
  );
}
