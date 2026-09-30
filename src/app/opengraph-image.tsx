import { ImageResponse } from "next/og";
import { personal, seo } from "@/config/portfolio";

export const alt = `${personal.name} — ${personal.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OpenGraph card.
 *
 * The content comes from src/config/portfolio.ts, so it stays correct when the
 * template is forked. The curve is the real integrated spring, drawn with the
 * same equation the lab uses.
 */

const PAPER = "#f4f1e8";
const INK = "#241b2f";
const INK3 = "#6b5c7e";
const SIGNAL = "#c8f542";
const RUBY = "#d94f2b";

/** Damped spring response, integrated once at render time. */
function springTrace(width: number, height: number, k: number, c: number) {
  const m = 1;
  const dt = 1 / 240;
  let x = 0;
  let v = 0;
  const points: Array<[number, number]> = [];
  const steps = 900;
  for (let i = 0; i <= steps; i++) {
    const progress = x;
    points.push([(i / steps) * width, height - height * (0.15 + progress * 0.7)]);
    const accel = (-k * x - c * v) / m;
    const nv = v + accel * dt;
    x += nv * dt;
    v = nv;
  }
  return points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
}

export default function OpengraphImage() {
  const settleX = 372;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        {/* Bench ruling */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(36,27,47,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(36,27,47,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", width: 14, height: 14, background: SIGNAL }} />
          <div style={{ fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: INK3 }}>
            {seo.repository.replace("https://github.com/", "")}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 66, lineHeight: 1.04, letterSpacing: -2, maxWidth: 1020 }}>
            {personal.name}
          </div>
          <div style={{ fontSize: 40, color: SIGNAL, marginTop: 8, letterSpacing: -1 }}>
            {personal.role}
          </div>
          <div style={{ fontSize: 25, color: INK3, marginTop: 18, maxWidth: 900 }}>
            {personal.tagline}
          </div>
        </div>

        {/* The measured curve. Note: Satori supports only <path> inside SVG,
            never <text>, so the annotation is a positioned div. */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ position: "relative", display: "flex", width: 560, height: 150 }}>
            <svg width="560" height="150" viewBox="0 0 560 150">
              <line x1="0" y1="140" x2="560" y2="140" stroke={INK} strokeOpacity="0.25" strokeWidth="1.5" />
              <path
                d={springTrace(560, 150, 320, 30)}
                fill="none"
                stroke={INK}
                strokeWidth="9"
                strokeOpacity="0.1"
                strokeLinecap="round"
              />
              <path
                d={springTrace(560, 150, 320, 30)}
                fill="none"
                stroke={SIGNAL}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <line x1={settleX} y1="0" x2={settleX} y2="150" stroke={RUBY} strokeWidth="2.5" />
            </svg>
            <div
              style={{
                position: "absolute",
                left: settleX + 10,
                top: 2,
                display: "flex",
                fontSize: 15,
                color: RUBY,
                fontFamily: "monospace",
              }}
            >
              settle 371ms
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            {[
              ["stack", "Next.js · TypeScript"],
              ["tests", "76 unit · 17 browser"],
              ["audit", "SHA-384 chain"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <span style={{ fontSize: 20, textTransform: "uppercase", letterSpacing: 3, color: INK3 }}>
                  {k}
                </span>
                <span style={{ fontSize: 20, color: INK }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
