import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SiteHeader } from "@/components/site-header";
import { Lab } from "@/components/lab";

/**
 * `next/link` needs an App Router context, and `next/navigation` needs a
 * pathname. Neither is what these tests are about, so both are stubbed.
 */
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Lab single-choice groups", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
    // The lab scores a draft against the analysis endpoint. The radio groups
    // render either way, so a failing request keeps the test offline.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: "offline" } }),
      })),
    );
  });

  it("exposes the motion model as a radio group", () => {
    render(<Lab />);
    const group = screen.getByRole("radiogroup", { name: /motion model/i });
    const radios = within(group).getAllByRole("radio");
    expect(radios.map((radio) => radio.textContent)).toEqual(["spring", "bezier"]);
  });

  it("exposes the animated property as a radio group", () => {
    render(<Lab />);
    const group = screen.getByRole("radiogroup", { name: /animated property/i });
    expect(within(group).getAllByRole("radio").length).toBeGreaterThan(1);
  });

  it("keeps only the selected model in the tab order", () => {
    render(<Lab />);
    const radios = within(screen.getByRole("radiogroup", { name: /motion model/i })).getAllByRole(
      "radio",
    );
    const checked = radios.filter((radio) => radio.getAttribute("aria-checked") === "true");
    expect(checked).toHaveLength(1);
    for (const radio of radios) {
      expect(radio.getAttribute("tabindex")).toBe(radio === checked[0] ? "0" : "-1");
    }
  });

  it("moves to the next model with ArrowRight and picks it", async () => {
    const user = userEvent.setup();
    render(<Lab />);

    const radios = within(screen.getByRole("radiogroup", { name: /motion model/i })).getAllByRole(
      "radio",
    );
    radios[0]!.focus();
    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(radios[1]);
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
  });
});

describe("ThemeSwitcher keyboard behaviour", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
  });

  it("exposes the palettes as one toolbar", () => {
    render(<ThemeSwitcher />);
    const group = screen.getByRole("toolbar", { name: /colour theme/i });
    const buttons = within(group).getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("keeps only the selected palette in the tab order", async () => {
    render(<ThemeSwitcher />);
    await waitForMount();

    const buttons = within(screen.getByRole("toolbar")).getAllByRole("button");
    const selected = buttons.find((button) => button.getAttribute("aria-pressed") === "true");
    expect(selected).toBeDefined();
    for (const button of buttons) {
      expect(button.getAttribute("tabindex")).toBe(button === selected ? "0" : "-1");
    }
  });

  it("moves to the next palette with ArrowRight and picks it", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await waitForMount();

    const buttons = within(screen.getByRole("toolbar")).getAllByRole("button");
    buttons[0]!.focus();
    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.getAttribute("data-theme")).toBe("ink");
  });

  it("wraps around at the end of the group", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await waitForMount();

    const buttons = within(screen.getByRole("toolbar")).getAllByRole("button");
    buttons[2]!.focus();
    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(buttons[0]);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("jumps to the last palette with End", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await waitForMount();

    const buttons = within(screen.getByRole("toolbar")).getAllByRole("button");
    buttons[0]!.focus();
    await user.keyboard("{End}");

    expect(document.activeElement).toBe(buttons[2]);
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
  });

  it("remembers the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await waitForMount();

    const buttons = within(screen.getByRole("toolbar")).getAllByRole("button");
    buttons[0]!.focus();
    await user.keyboard("{ArrowRight}");

    expect(window.localStorage.getItem("fm-theme")).toBe("ink");
  });
});

describe("SiteHeader mobile menu keyboard behaviour", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
  });

  it("moves focus into the menu when it opens", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const toggle = screen.getByRole("button", { name: /open menu/i });
    await user.click(toggle);

    const menu = document.getElementById("mobile-nav");
    expect(menu).not.toBeNull();
    const firstLink = within(menu as HTMLElement).getAllByRole("link")[0]!;
    expect(document.activeElement).toBe(firstLink);
  });

  it("closes on Escape and returns focus to the toggle", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const toggle = screen.getByRole("button", { name: /open menu/i });
    await user.click(toggle);
    expect(document.getElementById("mobile-nav")).not.toBeNull();

    await user.keyboard("{Escape}");

    expect(document.getElementById("mobile-nav")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /open menu/i }));
  });

  it("keeps Tab inside the open menu", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    const menu = document.getElementById("mobile-nav") as HTMLElement;
    const links = within(menu).getAllByRole("link");
    const last = links[links.length - 1]!;

    last.focus();
    await user.tab();

    // The last item wraps back to the first tab stop in the mobile header,
    // which is the theme switcher rather than a link behind the menu.
    expect(document.activeElement).not.toBeNull();
    expect(menu.contains(document.activeElement)).toBe(false);
    expect(last).not.toHaveFocus();
  });

  it("marks the toggle as expanded while the menu is open", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(screen.getByRole("button", { name: /close menu/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});

/**
 * The switcher reads the saved palette in a microtask after mount, so the
 * checked state only appears once that has settled.
 */
async function waitForMount() {
  await waitFor(() => {
    const buttons = within(screen.getByRole("toolbar")).getAllByRole("button");
    const pressed = buttons.filter((button) => button.getAttribute("aria-pressed") === "true");
    expect(pressed).toHaveLength(1);
  });
}
