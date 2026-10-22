import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScoreMeter } from "@/components/score-meter";
import { LiveSpringPreview } from "@/components/live-spring-preview";
import { AgentConsole } from "@/components/agent-console";
import type { MotionAnalysis, MotionParams, ScoreFactor } from "@/lib/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const FACTORS: ScoreFactor[] = [
  {
    id: "settle",
    label: "Settle time",
    value: 84,
    contribution: 26,
    evidence: "Comes to rest in 371ms (ideal is under 400ms).",
  },
  {
    id: "overshoot",
    label: "Overshoot",
    value: 62,
    contribution: 18,
    evidence: "Peaks 12% past the target.",
  },
];

const ANALYSIS = {
  score: 78,
  band: "balanced",
  settleTimeMs: 371,
  overshoot: 0.12,
  onsetMs: 41,
  seal: "a".repeat(96),
  factors: FACTORS,
  trace: [],
} as unknown as MotionAnalysis;

describe("ScoreMeter", () => {
  it("exposes each factor bar as a progress bar named by its visible label", () => {
    render(<ScoreMeter analysis={ANALYSIS} />);

    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(FACTORS.length);

    const settle = bars[0]!;
    expect(settle.getAttribute("aria-valuenow")).toBe("84");
    expect(settle.getAttribute("aria-valuemin")).toBe("0");
    expect(settle.getAttribute("aria-valuemax")).toBe("100");

    // The bar is named by the label the reader can already see.
    const labelledBy = settle.getAttribute("aria-labelledby");
    expect(labelledBy).not.toBeNull();
    expect(document.getElementById(labelledBy!)?.textContent).toBe("Settle time");
  });

  it("links the expander to the evidence it reveals", async () => {
    const user = userEvent.setup();
    render(<ScoreMeter analysis={ANALYSIS} />);

    const toggle = screen.getByRole("button", { name: /settle time/i });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    const controls = toggle.getAttribute("aria-controls");
    expect(controls).not.toBeNull();
    // Nothing is revealed yet, so the target does not exist.
    expect(document.getElementById(controls!)).toBeNull();

    await user.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    const revealed = document.getElementById(controls!);
    expect(revealed).not.toBeNull();
    expect(revealed?.textContent).toContain("Comes to rest in 371ms");
  });
});

describe("LiveSpringPreview", () => {
  const params: MotionParams = {
    kind: "spring",
    stiffness: 320,
    damping: 30,
    mass: 1,
    displacement: 100,
  };

  it("describes the motion for a screen reader", () => {
    render(<LiveSpringPreview params={params} target="translate" />);

    const preview = screen.getByRole("img");
    expect(preview.getAttribute("aria-label")).toContain("spring");
    expect(preview.getAttribute("aria-label")).toContain("translate");
  });

  it("hides the per-frame readout from assistive technology", () => {
    const { container } = render(<LiveSpringPreview params={params} target="translate" />);
    const readout = container.querySelector(".mt-2.flex");
    expect(readout).not.toBeNull();
    expect(readout?.getAttribute("aria-hidden")).toBe("true");
  });

  it("announces the phase of the preview", () => {
    render(<LiveSpringPreview params={params} target="translate" />);
    expect(screen.getByRole("status").textContent).toContain("Preview");
  });

  it("keeps the visible label inside the accessible name", () => {
    render(<LiveSpringPreview params={params} target="translate" />);

    const button = screen.getByRole("button");
    // The button reads "playing" while the preview runs.
    expect(button.textContent).toBe("playing");
    expect(button.getAttribute("aria-label")).toContain("playing");
  });
});

describe("AgentConsole", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ jsonrpc: "2.0", id: 1, result: {} }),
      })),
    );
  });

  it("labels the raw request field instead of relying on a placeholder", () => {
    render(<AgentConsole />);
    const field = screen.getByLabelText(/request body/i);
    expect(field.tagName).toBe("TEXTAREA");
  });

  it("describes the tool buttons with real text, not only a tooltip", () => {
    render(<AgentConsole />);
    const button = screen.getByRole("button", { name: "initialize" });
    const describedBy = button.getAttribute("aria-describedby");
    expect(describedBy).not.toBeNull();
    expect(document.getElementById(describedBy!)?.textContent).toContain("Negotiate the protocol");
  });
});
