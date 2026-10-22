import { describe, expect, it } from "vitest";
import { personal, heroStats, socials, projects } from "@/config/portfolio";

/**
 * `src/config/portfolio.ts` is the single source of truth for everything a
 * visitor sees, so the text a screen reader announces belongs here too.
 *
 * These checks are about the config, not the components: they fail when a
 * photo is added without alternative text, or a social link is added without
 * a description, which is exactly the moment the gap is cheapest to close.
 */

describe("portfolio config accessibility", () => {
  it("gives the avatar alternative text", () => {
    expect(personal.avatarAlt).toBeTypeOf("string");
    expect(personal.avatarAlt.trim().length).toBeGreaterThan(0);
  });

  it("gives the portrait alternative text", () => {
    expect(personal.portraitAlt).toBeTypeOf("string");
    expect(personal.portraitAlt.trim().length).toBeGreaterThan(0);
  });

  it("describes every social link, and starts the description with the label", () => {
    for (const social of socials) {
      expect(social.description, `${social.label} has no description`).toBeTypeOf("string");
      expect(social.description?.trim().length ?? 0).toBeGreaterThan(0);
      // The label stays inside the description, so the visible text is still
      // part of the accessible name (WCAG 2.5.3, Label in Name).
      expect(social.description?.startsWith(social.label)).toBe(true);
    }
  });

  it("gives every social link a real destination", () => {
    for (const social of socials) {
      expect(social.href.trim().length).toBeGreaterThan(0);
      expect(social.href).toMatch(/^(https?:\/\/|mailto:)/);
    }
  });

  it("hints at every headline number, so the tooltip is not the only copy", () => {
    for (const stat of heroStats) {
      expect(stat.hint.trim().length).toBeGreaterThan(0);
      expect(stat.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("gives every project a title and a summary to announce", () => {
    for (const project of projects) {
      expect(project.title.trim().length).toBeGreaterThan(0);
      expect(project.summary.trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps the avatar and the portrait on files that exist", () => {
    // The alt text is only useful if the image it describes is really there.
    for (const path of [personal.avatar, personal.portrait]) {
      expect(path.startsWith("/")).toBe(true);
      expect(path).toMatch(/\.(png|jpe?g|svg|webp|avif)$/);
    }
  });
});
