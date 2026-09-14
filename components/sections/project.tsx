"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FaChevronRight, FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { Project, projects } from "@/data/projects";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

export function ProjectSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section
      id="projects"
      className="py-28 relative overflow-hidden bg-charcoal"
    >
      {/* Sleek Minimal Section Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-crimson/35 to-transparent" />

      {/* Cinematic Ambient Lava / Sunset Radial Light */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-crimson/12 rounded-full filter blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[550px] h-[550px] bg-cream-gold/8 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/15 border border-crimson/30 text-cream text-xs font-semibold uppercase tracking-wider mb-3"
          >
            <span>Portfolio Highlights</span>
          </motion.div>

          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-gradient-crimson-cream"
          >
            Featured Projects
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
            className="text-base sm:text-lg text-[#d4c5ba]"
          >
            Production-grade AI platforms, computer vision proctoring systems, and interactive
            full-stack web applications with measurable real-world outcomes.
          </motion.p>
        </div>

        {/* Project Cards Grid with Staggered Scroll Entrance Every Time Visited */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.25, ease: "easeOut" } }}
              className="bg-charcoal-card/90 border border-charcoal-border hover:border-crimson/50 rounded-2xl shadow-xl hover:shadow-[0_10px_35px_-10px_rgba(196,30,58,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Project Screenshot / Visual Preview */}
                <div className="relative w-full h-48 overflow-hidden bg-black/40 border-b border-charcoal-border">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-top filter brightness-[0.92] contrast-[1.05] group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-card via-transparent to-transparent opacity-75" />
                </div>

                <div className="p-6">
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-crimson/15 text-cream border border-crimson/30"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-[#baa89d] border border-white/10">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-cream-soft font-display mb-2 group-hover:text-cream transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[#c2b3a8] line-clamp-3">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-charcoal-border/70 mt-2">
                <Button
                  size="sm"
                  className="bg-crimson/20 hover:bg-crimson text-cream hover:text-white font-medium text-xs border border-crimson/40 transition-all duration-300"
                  onClick={() => setSelectedProject(project)}
                >
                  View Details
                  <FaChevronRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Button>

                <div className="flex items-center space-x-2">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-cream/70 hover:text-cream hover:bg-white/5 rounded-lg transition-colors"
                      aria-label="GitHub Repository"
                    >
                      <FaGithub className="h-4 w-4" />
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-cream/70 hover:text-cream hover:bg-white/5 rounded-lg transition-colors"
                      aria-label="Live Demo"
                    >
                      <FaExternalLinkAlt className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Project Details Modal */}
        <Dialog
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
        >
          {selectedProject && (
            <DialogContent className="max-w-2xl bg-charcoal-card border-charcoal-border text-cream-soft sm:rounded-2xl shadow-2xl">
              <DialogHeader>
                <div className="relative w-full h-56 rounded-xl overflow-hidden mb-4 bg-black/60 border border-charcoal-border">
                  <Image
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-card via-transparent to-transparent opacity-60" />
                </div>
                <DialogTitle className="font-display text-2xl sm:text-3xl font-bold text-cream-soft">
                  {selectedProject.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#baa89d] mt-1">
                  {selectedProject.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                <div>
                  <h4 className="text-sm font-bold text-cream mb-1.5 uppercase tracking-wider text-xs">
                    Architecture &amp; Key Impact
                  </h4>
                  <p className="text-sm text-[#d4c5ba] leading-relaxed">
                    {selectedProject.details}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-cream mb-2 uppercase tracking-wider text-xs">
                    Technologies &amp; Tools Used
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs rounded-full bg-crimson/15 text-cream font-medium border border-crimson/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-charcoal-border">
                {selectedProject.github && (
                  <a
                    href={selectedProject.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2 border-charcoal-border text-cream hover:bg-white/5">
                      <FaGithub className="h-4 w-4" />
                      View Code
                    </Button>
                  </a>
                )}
                {selectedProject.live && (
                  <a
                    href={selectedProject.live}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="gap-2 bg-crimson hover:bg-crimson-glow text-white shadow-md">
                      <FaExternalLinkAlt className="h-3 w-3" />
                      Live Demo
                    </Button>
                  </a>
                )}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </section>
  );
}
