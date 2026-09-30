"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Mail, Sparkles } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

const focusSkills = [
  "Machine Learning & AI",
  "Autonomous AI Agents",
  "Computer Vision (OpenCV)",
  "Python",
  "Data Science & Analytics",
  "Next.js & React (basics)",
  "Flask REST APIs",
  "Docker & Git",
];

const skillDescriptions: Record<string, string> = {
  "Machine Learning & AI":
    "Predictive modeling, regression analysis, Scikit-Learn classifiers, and automated readiness scoring algorithms.",
  "Autonomous AI Agents":
    "Agentic workflows, prompt engineering architectures, Google AI Agents certified, and LLM API integrations.",
  "Computer Vision (OpenCV)":
    "Real-time video frame processing, face absence detection, head orientation tracking, and proctoring algorithms.",
  "Python":
    "Primary language for algorithmic development, machine learning pipelines, and backend microservices.",
  "Data Science & Analytics":
    "Exploratory Data Analysis (EDA), Pandas, NumPy, statistical data cleaning, and actionable visual reports.",
  "Next.js & React (basics)":
    "Modern reactive user interfaces, component architecture, SSR, and styling with Tailwind CSS.",
  "Flask REST APIs":
    "High-performance microservices, machine learning model serving, and RESTful CRUD synchronization.",
  "Docker & Git":
    "Containerized development environments, CI pipelines, and collaborative Git version control.",
};

const interests = [
  { icon: "🤖", label: "Autonomous AI Agents" },
  { icon: "👁️", label: "Computer Vision & ML" },
  { icon: "📊", label: "Data Science & EDA" },
  { icon: "⚡", label: "High-Performance Web" },
  { icon: "☁️", label: "Cloud & Microservices" },
  { icon: "🌐", label: "Open-Source Innovation" },
];

export function AboutSection() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [showBio, setShowBio] = useState(false);

  return (
    <section
      id="about"
      className="py-28 relative overflow-hidden bg-charcoal"
    >
      {/* Sleek Minimal Section Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-crimson/35 to-transparent" />

      {/* Soft sunset / lava ambient radial glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[550px] h-[550px] bg-crimson/15 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-cream-gold/10 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid gap-14 lg:grid-cols-12 items-center"
        >
          {/* Image Column */}
          <div className="lg:col-span-5 relative max-w-md mx-auto w-full">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative aspect-square rounded-3xl overflow-hidden border border-crimson/30 shadow-[0_0_50px_rgba(196,30,58,0.22)] bg-charcoal-card"
            >
              <Image
                src="/images/profile.jpg"
                alt="Subrat Kumar Sahoo"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-85 pointer-events-none" />

              {/* Overlay highlight badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-charcoal/85 backdrop-blur-md rounded-2xl border border-crimson/30 text-xs shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-cream-soft text-sm">Subrat Kumar Sahoo</p>
                    <p className="text-cream-gold font-medium mt-0.5">
                      AI &amp; ML Engineer • 8.95 CGPA
                    </p>
                  </div>
                  <Sparkles className="h-4 w-4 text-cream-gold" />
                </div>
              </div>
            </motion.div>

            {/* Glowing Accent Orb */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-crimson/25 rounded-full filter blur-2xl pointer-events-none" />
          </div>

          {/* Content Column */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/15 border border-crimson/30 text-cream text-xs font-semibold uppercase tracking-wider mb-3">
                <span>Who I Am</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold mb-4 text-gradient-crimson-cream">
                About Me
              </h2>

              <AnimatePresence mode="wait">
                {showBio ? (
                  <motion.div
                    key="full-bio"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-3.5 text-[#d4c5ba] leading-relaxed text-base"
                  >
                    <p>
                      I am a Computer Science undergraduate at KMBB College of Engineering &amp; Technology
                      (BPUT University, Odisha) maintaining an outstanding <strong className="text-cream-soft">8.95 CGPA</strong>.
                      My engineering focus centers on Artificial Intelligence, Machine Learning algorithms, and
                      scalable Full-Stack architectures.
                    </p>
                    <p>
                      I have completed multiple virtual industry internships across <strong className="text-cream-soft">Thiranex &amp; IncodeVision</strong> (Data Science)
                      and <strong className="text-cream-soft">XTRAGRAD</strong> (AI Engineering), developing end-to-end data preprocessing pipelines,
                      benchmarking predictive models, and architecting autonomous AI agent workflows.
                    </p>
                    <p>
                      My portfolio highlights production-deployed projects including <strong className="text-cream-soft">LearnVaultX</strong> (an AI-driven adaptive
                      learning platform) and <strong className="text-cream-soft">ExamSentinelX AI</strong> (a computer vision proctoring engine),
                      backed by 19+ verified industry credentials including Google AI Agents and BCG Data Science.
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="short-bio"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="text-[#d4c5ba] leading-relaxed text-base sm:text-lg"
                  >
                    Computer Science undergraduate specializing in Artificial Intelligence, Machine Learning,
                    and Full-Stack Engineering. Driven by building real-world AI applications, autonomous agents,
                    and high-performance web systems with measurable impact. Experienced in creating production platforms
                    like LearnVaultX and ExamSentinelX AI, complemented by virtual internships in Data Science and AI.
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                variant="link"
                onClick={() => setShowBio(!showBio)}
                className="mt-2 p-0 h-auto font-semibold text-cream-gold hover:text-cream transition-colors"
              >
                {showBio ? "Read Less" : "Read More"}
              </Button>
            </motion.div>

            {/* Core Skills Badges */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="space-y-3"
            >
              <h3 className="text-lg font-bold text-cream-soft font-display tracking-normal">
                Core Focus Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {focusSkills.map((skill, index) => (
                  <motion.button
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border ${
                      activeSkill === skill
                        ? "bg-crimson text-white border-crimson shadow-[0_0_15px_rgba(196,30,58,0.5)]"
                        : "bg-charcoal-card text-cream/90 border-charcoal-border hover:border-crimson/50 hover:bg-charcoal-elevated"
                    }`}
                    onClick={() => setActiveSkill(activeSkill === skill ? null : skill)}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {activeSkill && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="p-3.5 bg-charcoal-card/90 rounded-xl text-sm border border-crimson/30 text-cream/90 shadow-lg"
                  >
                    <span className="font-bold text-cream-gold">{activeSkill}: </span>
                    {skillDescriptions[activeSkill] || "Key competency featured across production projects."}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Interests Grid */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="space-y-3"
            >
              <h3 className="text-lg font-bold text-cream-soft font-display tracking-normal">
                Interests &amp; Passions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {interests.map((interest, index) => (
                  <motion.div
                    key={interest.label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="flex items-center space-x-2.5 p-3 bg-charcoal-card/70 rounded-xl border border-charcoal-border hover:border-crimson/40 transition-colors"
                  >
                    <span className="text-xl">{interest.icon}</span>
                    <span className="text-xs sm:text-sm text-cream/90 font-medium">
                      {interest.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
              className="flex flex-wrap gap-4 items-center pt-2"
            >
              <a
                href="/resume.pdf"
                download="Subrat_Kumar_Sahoo_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-gradient-to-r from-crimson to-[#e64a19] hover:from-crimson-glow hover:to-crimson text-white border border-crimson/40 shadow-[0_0_20px_rgba(196,30,58,0.35)] font-semibold">
                  <Download className="mr-2 h-4 w-4" />
                  Download CV
                </Button>
              </a>

              <Link href="/#contact">
                <Button
                  variant="outline"
                  className="border-cream/30 text-cream bg-charcoal/60 hover:bg-cream/10 hover:border-cream/60 font-semibold"
                >
                  <Mail className="mr-2 h-4 w-4 text-cream-gold" />
                  Contact Me
                </Button>
              </Link>

              <div className="flex items-center gap-2 ml-1">
                <a
                  href="https://github.com/ssubratkumar106-blip"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subrat Kumar Sahoo GitHub"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-cream/80 hover:text-cream hover:bg-white/5 border border-transparent hover:border-cream/20"
                  >
                    <FaGithub className="h-5 w-5" />
                  </Button>
                </a>

                <a
                  href="https://www.linkedin.com/in/subrat-kumar-sahoo-277664344"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subrat Kumar Sahoo LinkedIn"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-cream/80 hover:text-cream hover:bg-white/5 border border-transparent hover:border-cream/20"
                  >
                    <FaLinkedin className="h-5 w-5" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
