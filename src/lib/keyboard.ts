/**
 * Keyboard behaviour shared by every single-choice control in the app.
 *
 * The theme switcher, the motion-model toggle and the animated-property
 * toggle all pick exactly one option from a small set. Treating them as
 * plain buttons means a keyboard user has to Tab through every option to
 * find the one that is selected, and cannot move between options with the
 * arrow keys at all.
 *
 * The arrow-key rules below are the ones a native radio group uses, and the
 * `radio` role is what makes them announced correctly.
 */

/** Keys that move to the next option. */
const NEXT_KEYS = new Set(["ArrowRight", "ArrowDown"]);

/** Keys that move to the previous option. */
const PREVIOUS_KEYS = new Set(["ArrowLeft", "ArrowUp"]);

/**
 * Work out which option an arrow key should land on.
 *
 * Returns `null` when the key is not one of the radio keys, so callers can
 * leave the event alone and let the browser handle it.
 *
 * - Arrow keys move one option and wrap around at both ends.
 * - Home jumps to the first option, End to the last.
 */
export function nextRadioIndex(key: string, index: number, count: number): number | null {
  if (count <= 0) return null;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (NEXT_KEYS.has(key)) return (index + 1) % count;
  if (PREVIOUS_KEYS.has(key)) return (index - 1 + count) % count;
  return null;
}

/**
 * The tab stop for a single-choice option.
 *
 * Only the selected option is in the tab order — the others are reached with
 * the arrow keys. This is the "roving tabindex" pattern, and it is what
 * `role="radio"` requires.
 */
export function radioTabIndex(selected: boolean): 0 | -1 {
  return selected ? 0 : -1;
}
