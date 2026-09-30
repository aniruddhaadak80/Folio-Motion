"use client";

/**
 * Motion primitives.
 *
 * Every animation on this site is expressed through these components so the
 * physics is consistent and `prefers-reduced-motion` is honoured in one place.
 * Springs are specified as real physical values rather than arbitrary magic
 * numbers, matching the engine the product is built around.
 */

import { motion, useReducedMotion, useSpring, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Shared spring: the "bench standard" for reveals. Critically damped, no wobble. */
export const BENCH_SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;
export const SNAPPY_SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.6 } as const;
export const SOFT_SPRING = { type: "spring", stiffness: 140, damping: 22, mass: 1.1 } as const;

/* -------------------------------------------------------------------------- */
/* Reveal — scroll-triggered entrance                                          */
/* -------------------------------------------------------------------------- */

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Once the element has entered, stop observing (default) or re-animate. */
  repeat?: boolean;
  as?: "div" | "section" | "li" | "article";
}

export function Reveal({ children, delay = 0, y = 26, className, repeat = false, as = "div" }: RevealProps) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: !repeat, amount: 0.25, margin: "0px 0px -60px 0px" }}
      transition={{ ...BENCH_SPRING, delay }}
    >
      {children}
    </Comp>
  );
}

/* -------------------------------------------------------------------------- */
/* Stagger — a group of children that enter in sequence                       */
/* -------------------------------------------------------------------------- */

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: BENCH_SPRING },
};

export function StaggerGroup({
  children,
  className,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* SplitText — per-character reveal with a travelling mask                    */
/* -------------------------------------------------------------------------- */

export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.022,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "108%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ ...BENCH_SPRING, delay: delay + wi * stagger }}
          >
            {word}
            {wi < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* CountUp — a number that animates to its target                             */
/* -------------------------------------------------------------------------- */

export function CountUp({
  to,
  durationMs = 900,
  decimals = 0,
  suffix = "",
  className,
}: {
  to: number;
  durationMs?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  // Reduced motion, or a changed target, snaps straight to the final value
  // during render rather than scheduling an effect.
  const [settledTo, setSettledTo] = useState(reduced ? to : null);
  if (reduced && settledTo !== to) {
    setSettledTo(to);
    setValue(to);
  }

  useEffect(() => {
    if (reduced) return;
    // The first frame lands at t≈0, so the count starts from zero without
    // needing a synchronous setState here.
    let startTime = 0;
    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const t = Math.min(1, (now - startTime) / durationMs);
      // expo-out easing so the number decelerates into place
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(to * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [to, durationMs, reduced]);

  return (
    <span className={className}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Magnetic — an element that leans toward the pointer                        */
/* -------------------------------------------------------------------------- */

export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, SNAPPY_SPRING);
  const y = useSpring(0, SNAPPY_SPRING);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={(event) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) * strength;
        const dy = (event.clientY - (rect.top + rect.height / 2)) * strength;
        x.set(dx);
        y.set(dy);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* TiltCard — 3D tilt driven by the pointer                                   */
/* -------------------------------------------------------------------------- */

export function TiltCard({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, SOFT_SPRING);
  const ry = useSpring(0, SOFT_SPRING);
  const rotateX = useTransform(rx, [-1, 1], [max, -max]);
  const rotateY = useTransform(ry, [-1, 1], [-max, max]);

  // Reduced motion renders a plain container; the hooks above must still run.
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onPointerMove={(event) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        ry.set((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2));
        rx.set(-(event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2));
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* ScrollProgress — a filmstrip progress rail pinned to the top               */
/* -------------------------------------------------------------------------- */

export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScrollProgress();

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-50 h-[3px] origin-left"
      style={{
        scaleX: scrollYProgress,
        width: "100%",
        background: "linear-gradient(90deg, #c8f542, #2d6e8e)",
      }}
    />
  );
}

/** Minimal scroll progress hook kept local to avoid pulling in extra surface. */
function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { scrollYProgress: progress };
}

/* -------------------------------------------------------------------------- */
/* InViewOnce — a boolean "is on screen" signal for non-motion effects         */
/* -------------------------------------------------------------------------- */

export function useInViewOnce<T extends HTMLElement>(margin = "-15%") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin, inView]);

  return { ref, inView };
}
