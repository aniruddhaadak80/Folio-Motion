"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Briefcase, MapPin, Award, CheckCircle2, ChevronRight, GraduationCap } from "lucide-react";

type Experience = {
  role: string;
  company: string;
  duration: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
  iconType: "work" | "education";
};

const experiences: Experience[] = [
  {
    role: "AI Intern (Virtual)",
    company: "XTRAGRAD Pvt. Ltd.",
    duration: "July 2026 – August 2026",
    location: "Virtual / Remote",
    description:
      "Spearheaded autonomous AI agent workflows, prompt engineering architectures, and LLM tooling integration.",
    achievements: [
      "Contributed to the design of autonomous AI agent workflows for enterprise domain use cases.",
      "Integrated modern LLM APIs into rapid prototypes and internal productivity utilities.",
      "Conducted system latency profiling and fine-tuned prompt structures for high response accuracy.",
      "Documented technical specifications and collaborated with cross-functional product teams.",
    ],
    technologies: ["AI Agents", "Prompt Engineering", "LLM APIs", "Agent.ai", "FastAPI / Flask"],
    iconType: "work",
  },
  {
    role: "Data Science Intern (Virtual)",
    company: "Thiranex & IncodeVision",
    duration: "June 2026 – August 2026",
    location: "Virtual / Remote",
    description:
      "Executed end-to-end data preprocessing, exploratory analysis, and predictive machine learning modeling across production datasets.",
    achievements: [
      "Built end-to-end data cleaning pipelines and feature transformations utilizing Python, Pandas, and NumPy.",
      "Executed Exploratory Data Analysis (EDA) and crafted visualization dashboards for stakeholder reporting.",
      "Trained, benchmarked, and tuned regression and classification models with Scikit-Learn cross-validation.",
      "Practiced collaborative Git workflows within an Agile engineering team and delivered analytical insights.",
    ],
    technologies: ["Python", "Pandas", "NumPy", "Scikit-Learn", "Machine Learning", "EDA", "Git"],
    iconType: "work",
  },
  {
    role: "B.Tech in Computer Science & Engineering",
    company: "KMBB College of Engineering / BPUT University",
    duration: "2024 – Present",
    location: "Odisha, India",
    description:
      "Pursuing Computer Science & Engineering with an outstanding 8.95 / 10.0 CGPA, focusing on AI/ML and software systems.",
    achievements: [
      "Maintained a consistent 8.95 CGPA across all completed academic semesters.",
      "Engineered production applications: LearnVaultX (adaptive learning) and ExamSentinelX AI (proctoring).",
      "Earned 19+ verified industry credentials including Google 5-Day AI Agents and BCG Data Science.",
      "Active participant in technical problem-solving and open-source software development.",
    ],
    technologies: ["AI & ML", "Data Structures", "Algorithms", "Autonomous Agents", "Full-Stack"],
    iconType: "education",
  },
];

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

export function ExperienceSection() {
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  return (
    <section
      id="experiences"
      className="py-28 relative overflow-hidden bg-charcoal"
    >
      {/* Sleek Minimal Section Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-crimson/35 to-transparent" />

      {/* Ambient Sunset Glow */}
      <div className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-crimson/12 rounded-full filter blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-cream-gold/8 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={containerVariants}
          className="flex flex-col items-center"
        >
          <motion.div variants={cardVariants} className="text-center mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/15 border border-crimson/30 text-cream text-xs font-semibold uppercase tracking-wider mb-3">
              <span>Milestones</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-gradient-crimson-cream">
              Experience &amp; Education
            </h2>
            <p className="text-base sm:text-lg text-[#d4c5ba]">
              Virtual professional internships and academic excellence in Computer Science, Artificial
              Intelligence, and Data Science.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 justify-items-center w-full max-w-6xl">
            {experiences.map((experience) => (
              <motion.div
                key={experience.company}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="w-full h-full"
              >
                <Card
                  className="p-6 bg-charcoal-card/90 border border-charcoal-border hover:border-crimson/50 rounded-2xl h-full flex flex-col justify-between shadow-xl hover:shadow-[0_10px_35px_-10px_rgba(196,30,58,0.3)] transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedExperience(experience)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-crimson/15 border border-crimson/30 text-cream">
                        {experience.iconType === "work" ? (
                          <Briefcase className="h-5 w-5 text-cream-gold" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-cream-gold" />
                        )}
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-charcoal-elevated border border-charcoal-border text-cream">
                        {experience.duration}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-cream-soft mb-1 group-hover:text-cream transition-colors">
                      {experience.role}
                    </h3>
                    <p className="text-sm font-semibold text-crimson mb-2.5">
                      {experience.company}
                    </p>

                    <div className="flex items-center text-xs text-[#baa89d] gap-1.5 mb-4">
                      <MapPin className="h-3.5 w-3.5 text-cream-gold" />
                      <span>{experience.location}</span>
                    </div>

                    <p className="text-sm text-[#c2b3a8] leading-relaxed mb-4 line-clamp-3">
                      {experience.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {experience.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-charcoal-elevated text-cream border border-charcoal-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs font-semibold justify-between bg-charcoal-elevated/80 hover:bg-crimson/20 text-cream border border-charcoal-border group-hover:border-crimson/40 transition-all"
                    >
                      <span>View Key Milestones</span>
                      <ChevronRight className="h-3.5 w-3.5 text-cream-gold" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Experience Details Modal */}
        <Dialog
          open={!!selectedExperience}
          onOpenChange={(open) => !open && setSelectedExperience(null)}
        >
          {selectedExperience && (
            <DialogContent className="max-w-xl bg-charcoal-card border-charcoal-border text-cream-soft sm:rounded-2xl shadow-2xl">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-crimson/15 text-cream border border-crimson/30">
                    {selectedExperience.location}
                  </span>
                  <span className="text-xs text-[#baa89d]">
                    {selectedExperience.duration}
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl font-bold text-cream-soft">
                  {selectedExperience.role}
                </DialogTitle>
                <DialogDescription className="text-base font-semibold text-crimson">
                  {selectedExperience.company}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-3">
                <p className="text-sm text-[#d4c5ba] leading-relaxed">
                  {selectedExperience.description}
                </p>

                <div>
                  <h4 className="text-xs font-bold text-cream mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-cream-gold" />
                    Key Responsibilities &amp; Highlights:
                  </h4>
                  <ul className="space-y-2">
                    {selectedExperience.achievements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#c7b7ac]">
                        <CheckCircle2 className="h-4 w-4 text-crimson shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-cream mb-2 uppercase tracking-wider">
                    Technologies &amp; Competencies:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedExperience.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 text-xs rounded-full bg-charcoal-elevated border border-charcoal-border text-cream font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </section>
  );
}
