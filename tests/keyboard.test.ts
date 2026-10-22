import { describe, expect, it } from "vitest";
import { nextRadioIndex, radioTabIndex } from "@/lib/keyboard";

describe("nextRadioIndex", () => {
  it("moves to the next option with ArrowRight and ArrowDown", () => {
    expect(nextRadioIndex("ArrowRight", 0, 3)).toBe(1);
    expect(nextRadioIndex("ArrowDown", 1, 3)).toBe(2);
  });

  it("moves to the previous option with ArrowLeft and ArrowUp", () => {
    expect(nextRadioIndex("ArrowLeft", 1, 3)).toBe(0);
    expect(nextRadioIndex("ArrowUp", 2, 3)).toBe(1);
  });

  it("wraps around at both ends", () => {
    expect(nextRadioIndex("ArrowRight", 2, 3)).toBe(0);
    expect(nextRadioIndex("ArrowLeft", 0, 3)).toBe(2);
  });

  it("jumps to the first and last option with Home and End", () => {
    expect(nextRadioIndex("Home", 2, 3)).toBe(0);
    expect(nextRadioIndex("End", 0, 3)).toBe(2);
  });

  it("ignores keys that are not radio keys", () => {
    expect(nextRadioIndex("a", 0, 3)).toBeNull();
    expect(nextRadioIndex("Enter", 0, 3)).toBeNull();
    expect(nextRadioIndex("Tab", 0, 3)).toBeNull();
    expect(nextRadioIndex(" ", 0, 3)).toBeNull();
  });

  it("returns null when there is nothing to move to", () => {
    expect(nextRadioIndex("ArrowRight", 0, 0)).toBeNull();
    expect(nextRadioIndex("Home", 0, 0)).toBeNull();
  });
});

describe("radioTabIndex", () => {
  it("keeps only the selected option in the tab order", () => {
    expect(radioTabIndex(true)).toBe(0);
    expect(radioTabIndex(false)).toBe(-1);
  });
});
