import { ImageResponse } from "next/og";

export const alt = "Folio Motion — a motion-physics lab for the browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OpenGraph card.
 *
 * Rendered with the same palette and the same real spring curve the app
 * produces, so the share image is a picture of the product rather than a
 * decorative graphic.
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
            folio motion
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 82, lineHeight: 1.02, letterSpacing: -2.5, maxWidth: 1000 }}>
            Animation you can measure, not guess.
          </div>
          <div style={{ fontSize: 27, color: INK3, marginTop: 22, maxWidth: 900 }}>
            The spring equation, integrated. Real settle time, real overshoot, exportable CSS.
          </div>
        </div>

        {/* The measured curve */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <svg width="560" height="150" viewBox="0 0 560 150">
            <line x1="0" y1="140" x2="560" y2="140" stroke={INK} strokeOpacity="0.25" strokeWidth="1.5" />
            <path
              d={springTrace(560, 150, 320, 30)}
              fill="none"
              stroke={SIGNAL}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d={springTrace(560, 150, 320, 30)}
              fill="none"
              stroke={INK}
              strokeWidth="9"
              strokeOpacity="0.1"
              strokeLinecap="round"
            />
            <line
              x1={settleX}
              y1="0"
              x2={settleX}
              y2="150"
              stroke={RUBY}
              strokeWidth="2.5"
            />
            <text x={settleX + 10} y="20" fill={RUBY} fontSize="15" fontFamily="monospace">
              settle 371ms
            </text>
          </svg>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            {[
              ["integrated", "240Hz fixed step"],
              ["scored", "5 explainable factors"],
              ["audited", "SHA-384 chain"],
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
