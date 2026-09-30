"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, Sparkles, FolderGit2, Mail } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16"
    >
      {/* Background Video - 100% Bright, Vivid, Completely Clear as in Reference Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        style={{ y: videoY }}
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/videos/hero-poster.jpg"
          className="w-full h-full object-cover scale-105 filter brightness-100 contrast-100 saturate-100"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Seamless Smooth Bottom Fade into Dark Theme Only (NO center darkening or hazy box) */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-charcoal via-charcoal/70 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-charcoal/60 to-transparent pointer-events-none" />
      </motion.div>

      {/* Floating Diamond Sparkle Accent on Right as in Reference Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.15, 0.9], rotate: [0, 45, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-8 sm:right-16 md:right-28 bottom-28 z-10 pointer-events-none text-[#e8d8c8]"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-[0_0_12px_rgba(245,230,200,0.7)]">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </motion.div>

      {/* Hero Content - Seamless Floating (No Rectangular Card Box) */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container mx-auto px-4 z-10 relative"
      >
        <div className="text-center max-w-4xl mx-auto">
          {/* Status & Category Badges (Pills) */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center px-3.5 py-1 rounded-full border border-emerald-500/40 bg-black/60 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Available for Opportunities
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-amber-600/40 bg-black/60 text-[#f5ebd9] text-xs font-semibold backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>Personal Portfolio</span>
            </motion.div>
          </div>

          {/* Name Heading: Warm Cream/Ivory Font Color (NOT stark white), Playfair Display, Matching Reference */}
          <motion.h1
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="font-display text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-4 text-[#f5ebd9] leading-[1.1] drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] drop-shadow-[0_8px_40px_rgba(0,0,0,0.9)]"
          >
            Subrat Kumar
            <br />
            Sahoo
          </motion.h1>

          {/* Typewriter Line in Warm Sunset Coral/Amber Tone */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#eb6036] mb-6 h-[50px] flex items-center justify-center drop-shadow-[0_2px_15px_rgba(0,0,0,0.95)]"
          >
            <TypeAnimation
              sequence={[
                "AI & Machine Learning Engineer",
                1500,
                "Data Science Specialist",
                1500,
                "Full-Stack Developer",
                1500,
                "Autonomous Agents & Computer Vision Builder",
                1500,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </motion.div>

          {/* Bio Text in Warm Ivory with Crisp Drop Shadow */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="text-base sm:text-lg text-[#e5dcd3] max-w-2xl mx-auto mb-9 leading-relaxed font-sans drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
          >
            Computer Science undergraduate specializing in Artificial Intelligence, Machine Learning,
            and Full-Stack Engineering. Dedicated to building intelligent systems, autonomous agents,
            and high-performance applications with measurable impact.
          </motion.p>

          {/* Action Buttons Matching Reference Image Exactly */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-3.5"
          >
            <Link href="/#projects">
              <Button
                size="lg"
                className="group font-semibold text-white bg-gradient-to-r from-[#d93829] to-[#ea502c] hover:from-[#c92f21] hover:to-[#db4521] rounded-xl px-6 py-2.5 shadow-[0_4px_25px_rgba(217,56,41,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <FolderGit2 className="mr-2 h-4 w-4" />
                View Projects
                <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
              </Button>
            </Link>

            <a
              href="/resume.pdf"
              download="Subrat_Kumar_Sahoo_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="bg-black/60 hover:bg-black/80 border border-white/25 hover:border-white/45 text-[#f5ebd9] font-semibold rounded-xl backdrop-blur-md px-6 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all duration-300"
              >
                <Download className="mr-2 h-4 w-4 text-[#eb6036]" />
                Download Resume
              </Button>
            </a>

            <Link href="/#contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-black/60 hover:bg-black/80 border border-white/20 hover:border-white/40 text-[#f5ebd9] font-semibold rounded-xl backdrop-blur-md px-6 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-colors"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Me
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1,
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
      >
        <Link href="/#about" aria-label="Scroll down to About Section">
          <ChevronDown className="h-6 w-6 text-[#f5ebd9]/75 hover:text-[#f5ebd9] transition-colors cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
        </Link>
      </motion.div>
    </section>
  );
}
