import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ExternalLink, Github, Star, CheckCircle2 } from "lucide-react";
import { getProject, projects } from "@/config/portfolio";
import { Reveal } from "@/components/motion-primitives";
import { ProjectCard } from "@/components/project-card";

/** Pre-render every project page at build time. */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [{ url: project.image }],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const more = projects.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <>
      <article>
        {/* ------------------------------------------------------------ head */}
        <header className="border-b border-[var(--color-line)]">
          <div aria-hidden className="filmstrip h-1.5 w-full opacity-30" />
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            <Link
              href="/projects"
              className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
            >
              <ArrowLeft size={11} /> All projects
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {project.status && <span className="chip chip-live">{project.status}</span>}
              {project.featured && (
                <span className="chip">
                  <Star size={9} /> featured
                </span>
              )}
              <span className="chip">{project.year}</span>
            </div>

            <h1 className="mt-4 text-4xl sm:text-5xl">{project.title}</h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-[var(--color-ink-2)]">
              {project.summary}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {project.links?.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bench"
                >
                  Visit live site <ExternalLink size={14} />
                </a>
              )}
              {project.links?.repo && (
                <a
                  href={project.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  <Github size={14} /> Source code
                </a>
              )}
            </div>
          </div>
        </header>

        {/* ----------------------------------------------------------- cover */}
        <div className="border-b border-[var(--color-line)]">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <Reveal>
              <div className="relative aspect-[16/8] overflow-hidden border border-[var(--color-line)] bg-[var(--color-paper-2)]">
                <Image
                  src={project.image}
                  alt={`${project.title} cover`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>

        {/* ------------------------------------------------------------ body */}
        <div className="border-b border-[var(--color-line)]">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            <div className="prose-bench text-base">
              {project.description.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}

              {project.highlights && project.highlights.length > 0 && (
                <>
                  <h2 className="mt-10 text-2xl">What made it interesting</h2>
                  <ul className="mt-4 space-y-2.5">
                    {project.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2.5 text-sm text-[var(--color-ink-2)]">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--color-signal-2)]" />
                        <span className="leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {project.proudest && (
                <>
                  <h2 className="mt-10 text-2xl">The bit I&apos;m proudest of</h2>
                  <p className="mt-4 border-l-2 border-[var(--color-signal-2)] pl-4 italic">
                    {project.proudest}
                  </p>
                </>
              )}
            </div>

            <aside className="lg:sticky lg:top-20 lg:self-start">
              <div className="panel p-5">
                <p className="label">Stack</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {project.tech.map((tech) => (
                    <li key={tech} className="chip">
                      {tech}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 border-t border-[var(--color-line-soft)] pt-4">
                  <p className="label">Links</p>
                  <ul className="mt-3 space-y-2">
                    {project.links?.live && (
                      <li>
                        <a
                          href={project.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mono inline-flex items-center gap-1.5 text-[11px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
                        >
                          Live site <ArrowUpRight size={11} />
                        </a>
                      </li>
                    )}
                    {project.links?.repo && (
                      <li>
                        <a
                          href={project.links.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mono inline-flex items-center gap-1.5 text-[11px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
                        >
                          Source <ArrowUpRight size={11} />
                        </a>
                      </li>
                    )}
                    {project.links?.caseStudy && (
                      <li>
                        <a
                          href={project.links.caseStudy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mono inline-flex items-center gap-1.5 text-[11px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
                        >
                          Case study <ArrowUpRight size={11} />
                        </a>
                      </li>
                    )}
                    {!project.links?.live && !project.links?.repo && !project.links?.caseStudy && (
                      <li className="mono text-[11px] text-[var(--color-ink-3)]">
                        Not published — available on request
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* ------------------------------------------------------------- more */}
      {more.length > 0 && (
        <section>
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <p className="label">More projects</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((item) => (
                <ProjectCard key={item.slug} project={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
