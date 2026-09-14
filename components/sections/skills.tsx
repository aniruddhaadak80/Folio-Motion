"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, X } from "lucide-react";

interface Skill {
  name: string;
  level: number;
  icon: string;
  description: string;
  projects: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function SkillSection() {
  const [showLevel, setShowLevel] = useState<boolean>(true);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [visibleSkills, setVisibleSkills] = useState<number>(6);

  const skills: Skill[] = [
    {
      name: "Python",
      level: 95,
      icon: "🐍",
      description: "Primary language for ML pipelines, deep algorithms, data science, and high-performance API engineering.",
      projects: ["LearnVaultX", "ExamSentinelX AI", "Apple Stock Price Analysis"],
    },
    {
      name: "Machine Learning & AI",
      level: 92,
      icon: "🤖",
      description: "Predictive regression modeling, Scikit-Learn classifiers, hyperparameter tuning, and automated scoring.",
      projects: ["LearnVaultX", "ExamSentinelX AI", "Apple Stock Price Analysis"],
    },
    {
      name: "Autonomous AI Agents",
      level: 90,
      icon: "🧠",
      description: "Agentic workflows, prompt engineering, Google AI Agents course graduate, and LLM API integrations.",
      projects: ["XTRAGRAD AI Workflows", "LearnVaultX LLM Engine", "Autonomous Utilities"],
    },
    {
      name: "Computer Vision (OpenCV)",
      level: 88,
      icon: "👁️",
      description: "Real-time video frame processing, face detection, gaze angle tracking, and automated invigilation.",
      projects: ["ExamSentinelX AI", "Haar Cascade Detection", "Motion Analysis"],
    },
    {
      name: "Data Science & Analytics",
      level: 91,
      icon: "📊",
      description: "Exploratory Data Analysis (EDA), NumPy, Pandas, data cleaning, and statistical reporting.",
      projects: ["Apple Stock Price Analysis", "Thiranex Internship", "IncodeVision EDA"],
    },
    {
      name: "Next.js & React (basics)",
      level: 78,
      icon: "⚛️",
      description: "Reactive component design, responsive UI layouts, Tailwind CSS styling, and SSR web fundamentals.",
      projects: ["Folio Motion Portfolio", "Futuristic Tic Tac Toe"],
    },
    {
      name: "Flask & REST APIs",
      level: 86,
      icon: "⚡",
      description: "Lightweight backend microservices, ML model inference endpoints, and responsive client-server synchronization.",
      projects: ["LearnVaultX Backend", "Daily Task Tracker", "ExamSentinelX AI Service"],
    },
    {
      name: "Docker & Git",
      level: 85,
      icon: "🐳",
      description: "Containerized application runtime, CI workflows, and collaborative Git version control.",
      projects: ["LearnVaultX Deployment", "Open Source Repositories", "Production Environments"],
    },
  ];

  const toggleSkillExpansion = (skillName: string) => {
    setExpandedSkill(expandedSkill === skillName ? null : skillName);
  };

  const showMoreSkills = () => {
    setVisibleSkills((prevVisible) => Math.min(prevVisible + 3, skills.length));
  };

  return (
    <section
      id="skills"
      className="py-28 relative overflow-hidden bg-charcoal"
    >
      {/* Sleek Minimal Section Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-crimson/35 to-transparent" />

      {/* Ambient Lava Light */}
      <div className="absolute top-1/3 left-0 w-[550px] h-[550px] bg-crimson/12 rounded-full filter blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-cream-gold/8 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/15 border border-crimson/30 text-cream text-xs font-semibold uppercase tracking-wider mb-3"
          >
            <span>Proficiencies</span>
          </motion.div>

          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-gradient-crimson-cream"
          >
            Technical Competencies
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
            className="text-base sm:text-lg text-[#d4c5ba] mb-6"
          >
            Specialized toolset and engineering competencies with real-time proficiency indicators.
          </motion.p>

          <Button
            variant="outline"
            onClick={() => setShowLevel(!showLevel)}
            className="transition-all border-crimson/40 bg-charcoal-card/80 text-cream hover:bg-crimson/20 hover:border-crimson"
          >
            {showLevel ? "Hide Proficiency Levels" : "Show Proficiency Levels"}
          </Button>
        </div>

        {/* Skills Cards Grid with Staggered Scroll Animations Re-triggered On Every Visit */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {skills.slice(0, visibleSkills).map((skill) => (
              <motion.div
                key={skill.name}
                layout
                variants={itemVariants}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.25 },
                }}
                className="relative overflow-hidden rounded-2xl bg-charcoal-card/90 border border-charcoal-border hover:border-crimson/40 shadow-lg hover:shadow-[0_10px_30px_-10px_rgba(196,30,58,0.25)] transition-all min-h-[230px]"
              >
                {/* Subtle lava ambient gradient accent on the card header */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-crimson via-[#e65c00] to-cream-gold opacity-80" />

                <AnimatePresence mode="wait">
                  {expandedSkill === skill.name ? (
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="absolute inset-0 p-6 overflow-y-auto bg-charcoal-elevated/98 backdrop-blur-md z-20 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-display text-cream-soft font-bold text-xl flex items-center gap-2">
                            <span>{skill.icon}</span>
                            <span>{skill.name}</span>
                          </h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-cream/70 hover:text-cream hover:bg-white/10 h-8 w-8 p-0 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSkillExpansion(skill.name);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-[#c7b7ac] text-xs sm:text-sm leading-relaxed mb-4">
                          {skill.description}
                        </p>

                        <h5 className="text-cream-gold font-bold text-[11px] uppercase tracking-wider mb-2">
                          Applied In Projects:
                        </h5>
                        <ul className="space-y-1.5 text-xs text-[#d4c5ba]">
                          {skill.projects.map((project, pIdx) => (
                            <li key={pIdx} className="flex items-center gap-2">
                              <span className="text-crimson font-bold">•</span> {project}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {showLevel && (
                        <div className="mt-4 pt-3 border-t border-charcoal-border flex items-center justify-between text-xs text-cream">
                          <span className="font-semibold text-[#baa89d]">Proficiency Rating:</span>
                          <span className="font-extrabold text-sm text-cream-gold">{skill.level}%</span>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="collapsed"
                      className="p-6 relative z-10 flex flex-col justify-between h-full"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl filter drop-shadow-md select-none">{skill.icon}</span>
                          {showLevel && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-crimson/15 text-cream border border-crimson/30">
                              {skill.level}%
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-cream-soft mb-2 tracking-tight font-display">
                          {skill.name}
                        </h3>

                        <p className="text-xs text-[#baa89d] line-clamp-2 leading-relaxed">
                          {skill.description}
                        </p>
                      </div>

                      <div className="mt-5">
                        {showLevel && (
                          <div className="w-full bg-black/50 rounded-full h-2 mb-4 overflow-hidden border border-charcoal-border">
                            <motion.div
                              className="bg-gradient-to-r from-crimson via-[#e65c00] to-cream-gold h-2 rounded-full"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.level}%` }}
                              viewport={{ once: false }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        )}

                        <Button
                          size="sm"
                          className="w-full bg-charcoal-elevated hover:bg-crimson/20 text-cream font-medium text-xs border border-charcoal-border hover:border-crimson/40 transition-all"
                          onClick={() => toggleSkillExpansion(skill.name)}
                        >
                          More Details
                          <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {visibleSkills < skills.length && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <Button
              onClick={showMoreSkills}
              size="lg"
              className="gap-2 font-semibold bg-charcoal-card text-cream border border-crimson/40 hover:bg-crimson/20 hover:border-crimson shadow-md"
            >
              Show More Skills
              <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
