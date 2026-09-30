"use client";

/**
 * Motion primitives.
 *
 * Every animation in the portfolio is expressed through these components, so
 * the physics is consistent and `prefers-reduced-motion` is handled in exactly
 * one place. Springs use real physical values rather than arbitrary numbers.
 */

import { motion, useReducedMotion, useSpring, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const BENCH_SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;
export const SNAPPY_SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.6 } as const;
export const SOFT_SPRING = { type: "spring", stiffness: 140, damping: 22, mass: 1.1 } as const;

/* -------------------------------------------------------------------------- */
/* Section header — the consistent opening for every band on the page          */
/* -------------------------------------------------------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const centered = align === "center";

  return (
    <div className={`${centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className ?? ""}`}>
      <Reveal>
        <p
          className={`label flex items-center gap-2 ${centered ? "justify-center" : ""}`}
        >
          <span aria-hidden className="inline-block h-2 w-2 bg-[var(--color-signal)]" />
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      </Reveal>
      {lede && (
        <Reveal delay={0.12}>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-[var(--color-ink-2)] sm:text-base">
            {lede}
          </p>
        </Reveal>
      )}
      {reduced && <span className="sr-only">{title}</span>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reveal — scroll-triggered entrance                                          */
/* -------------------------------------------------------------------------- */

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Re-run the animation every time it scrolls into view. */
  repeat?: boolean;
  as?: "div" | "section" | "li" | "article" | "span";
}

export function Reveal({ children, delay = 0, y = 26, className, repeat = false, as = "div" }: RevealProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: !repeat, amount: 0.2, margin: "0px 0px -50px 0px" }}
      transition={{ ...BENCH_SPRING, delay }}
    >
      {children}
    </Comp>
  );
}

/* -------------------------------------------------------------------------- */
/* Stagger — a group whose children enter in sequence                          */
/* -------------------------------------------------------------------------- */

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.03 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: BENCH_SPRING },
};

export function StaggerGroup({
  children,
  className,
  amount = 0.12,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  as?: "div" | "ul";
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }
  const Comp = as === "ul" ? motion.ul : motion.div;
  return (
    <Comp
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp className={className} variants={staggerItem}>
      {children}
    </Comp>
  );
}

/* -------------------------------------------------------------------------- */
/* SplitText — a per-word reveal behind a mask                                */
/* -------------------------------------------------------------------------- */

export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  as = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "h1" | "h2";
}) {
  const reduced = useReducedMotion();
  const Tag = as;

  if (reduced) return <Tag className={className}>{text}</Tag>;

  const words = text.split(" ");

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom pb-[0.08em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ ...BENCH_SPRING, delay: delay + i * stagger }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* Typewriter — the hero's rotating role text                                   */
/* -------------------------------------------------------------------------- */

export function Typewriter({
  words,
  className,
  typeMs = 55,
  holdMs = 1500,
}: {
  words: readonly string[];
  className?: string;
  typeMs?: number;
  holdMs?: number;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(reduced ? words[0] ?? "" : "");
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    // The typing clock is an external timer, so state updates belong in its
    // callback. The first tick yields to a microtask, which keeps the effect
    // body free of synchronous state changes.
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      if (cancelled) return;
      const word = words[index % words.length] ?? "";

      if (!erasing && text === word) {
        timer = setTimeout(() => {
          if (cancelled) return;
          setErasing(true);
          tick();
        }, holdMs);
        return;
      }

      if (erasing && text === "") {
        setErasing(false);
        setIndex((i) => (i + 1) % words.length);
        return;
      }

      timer = setTimeout(() => {
        if (cancelled) return;
        setText((prev) => (erasing ? prev.slice(0, -1) : word.slice(0, prev.length + 1)));
        tick();
      }, erasing ? typeMs * 0.6 : typeMs);
    };

    void Promise.resolve().then(() => {
      if (cancelled) return;
      if (reduced) {
        setText(words[0] ?? "");
        return;
      }
      tick();
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [text, erasing, index, words, typeMs, holdMs, reduced]);

  return (
    <span className={className}>
      {/* Screen readers get the full list once, not a character stream. */}
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden>{text}</span>
      {!reduced && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-[var(--color-signal)]"
          style={{ animation: "fm-blink 1.1s steps(1) infinite" }}
        />
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* CountUp                                                                    */
/* -------------------------------------------------------------------------- */

export function CountUp({
  to,
  durationMs = 1100,
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

  const [settledTo, setSettledTo] = useState<number | null>(reduced ? to : null);
  if (reduced && settledTo !== to) {
    setSettledTo(to);
    setValue(to);
  }

  useEffect(() => {
    if (reduced) return;
    let startTime = 0;
    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const t = Math.min(1, (now - startTime) / durationMs);
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
/* Magnetic — leans toward the pointer                                         */
/* -------------------------------------------------------------------------- */

export function Magnetic({
  children,
  strength = 0.25,
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
        x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
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
/* TiltCard — 3D tilt driven by the pointer                                    */
/* -------------------------------------------------------------------------- */

export function TiltCard({
  children,
  className,
  max = 6,
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
/* ScrollProgress — a rail pinned to the top of the viewport                   */
/* -------------------------------------------------------------------------- */

export function ScrollProgress() {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) return;
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
  }, [reduced]);

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-50 h-[3px] origin-left"
      style={{
        scaleX: progress,
        width: "100%",
        background: "linear-gradient(90deg, var(--color-signal), var(--color-cobalt))",
      }}
    />
  );
}
