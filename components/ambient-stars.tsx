"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function AmbientStars() {
  const [stars, setStars] = useState<Star[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 3000], [0, -120]);
  const sparkleParallax = useTransform(scrollY, [0, 3000], [0, -60]);

  useEffect(() => {
    // Generate gentle starfield client-side to prevent SSR hydration mismatch
    const colors = ["#ffffff", "#f5e6c8", "#f0d9a8", "#ffeed6", "#ffe2be"];
    const generatedStars: Star[] = Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() < 0.7 ? 1.5 : Math.random() < 0.9 ? 2 : 2.8,
      opacity: 0.15 + Math.random() * 0.45,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // 6 larger 4-point diamond sparkles scattered sparingly
    const generatedSparkles: Sparkle[] = [
      { id: 1, x: 12, y: 18, size: 18, duration: 4.5, delay: 0.2 },
      { id: 2, x: 86, y: 22, size: 22, duration: 5.2, delay: 1.5 },
      { id: 3, x: 74, y: 55, size: 16, duration: 4.8, delay: 0.8 },
      { id: 4, x: 18, y: 68, size: 20, duration: 5.5, delay: 2.1 },
      { id: 5, x: 92, y: 82, size: 15, duration: 4.2, delay: 1.1 },
      { id: 6, x: 38, y: 88, size: 17, duration: 5.0, delay: 2.8 },
    ];

    setStars(generatedStars);
    setSparkles(generatedSparkles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Subtle global ambient gradient glow in the sunset/lava palette */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110vw] h-[70vh] bg-[radial-gradient(ellipse_at_top,_rgba(196,30,58,0.14)_0%,_rgba(240,217,168,0.06)_35%,_rgba(10,5,3,0)_70%)]" />
      <div className="absolute top-[40%] right-0 w-[55vw] h-[55vh] bg-[radial-gradient(circle_at_center,_rgba(196,30,58,0.09)_0%,_rgba(10,5,3,0)_65%)]" />
      <div className="absolute bottom-[10%] left-0 w-[50vw] h-[50vh] bg-[radial-gradient(circle_at_center,_rgba(240,217,168,0.06)_0%,_rgba(10,5,3,0)_65%)]" />

      {/* Parallax Starfield */}
      <motion.div style={{ y: parallaxY }} className="absolute inset-0 w-full h-full">
        {stars.map((star) => (
          <motion.span
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: star.size > 2 ? `0 0 6px ${star.color}` : "none",
            }}
            animate={{
              opacity: [star.opacity * 0.4, star.opacity, star.opacity * 0.4],
              scale: [0.85, 1.15, 0.85],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* 4-Point Diamond Sparkles */}
      <motion.div style={{ y: sparkleParallax }} className="absolute inset-0 w-full h-full">
        {sparkles.map((sp) => (
          <motion.div
            key={sp.id}
            className="absolute flex items-center justify-center text-cream"
            style={{
              left: `${sp.x}%`,
              top: `${sp.y}%`,
              width: `${sp.size}px`,
              height: `${sp.size}px`,
            }}
            animate={{
              opacity: [0.25, 0.85, 0.25],
              scale: [0.85, 1.2, 0.85],
              rotate: [0, 90, 180],
            }}
            transition={{
              duration: sp.duration,
              delay: sp.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* 4-point star SVG */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full text-cream drop-shadow-[0_0_8px_rgba(245,230,200,0.6)]"
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
