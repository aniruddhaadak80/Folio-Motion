import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isValidOwner,
  newOwnerId,
  OWNER_COOKIE,
  OWNER_COOKIE_OPTIONS,
  resolveSession,
  scopeMatches,
} from "@/lib/session";

const { cookieJar } = vi.hoisted(() => ({ cookieJar: new Map<string, string>() }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.has(name) ? { name, value: cookieJar.get(name) } : undefined,
  }),
}));

beforeEach(() => {
  cookieJar.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isValidOwner", () => {
  it("accepts an id of the right shape", () => {
    expect(isValidOwner("a".repeat(16))).toBe(true);
    expect(isValidOwner("A-b_9".repeat(4))).toBe(true);
    expect(isValidOwner("a".repeat(64))).toBe(true);
  });

  it("rejects an id that is too short or too long", () => {
    expect(isValidOwner("a".repeat(15))).toBe(false);
    expect(isValidOwner("a".repeat(65))).toBe(false);
    expect(isValidOwner("")).toBe(false);
  });

  it("rejects an id with characters outside the alphabet", () => {
    expect(isValidOwner(`${"a".repeat(15)}!`)).toBe(false);
    expect(isValidOwner(`${"a".repeat(15)}.`)).toBe(false);
    expect(isValidOwner(`${"a".repeat(15)}/`)).toBe(false);
    expect(isValidOwner(`${"a".repeat(15)} `)).toBe(false);
  });

  it("rejects anything that is not a string", () => {
    expect(isValidOwner(undefined)).toBe(false);
    expect(isValidOwner(null)).toBe(false);
    expect(isValidOwner(42)).toBe(false);
    expect(isValidOwner({ length: 16 })).toBe(false);
  });
});

describe("newOwnerId", () => {
  it("mints an id the validator accepts", () => {
    expect(isValidOwner(newOwnerId())).toBe(true);
  });

  it("mints a different id every time", () => {
    const ids = new Set(Array.from({ length: 50 }, () => newOwnerId()));
    expect(ids.size).toBe(50);
  });

  it("mints an id that is safe to put in a cookie", () => {
    // base64url, not base64: no '+' or '/', which a cookie value may not carry.
    expect(newOwnerId()).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("OWNER_COOKIE_OPTIONS", () => {
  it("keeps the scope unreadable from scripts and off other sites", () => {
    expect(OWNER_COOKIE_OPTIONS.httpOnly).toBe(true);
    expect(OWNER_COOKIE_OPTIONS.sameSite).toBe("lax");
    expect(OWNER_COOKIE_OPTIONS.path).toBe("/");
  });

  it("expires the scope with the session", () => {
    expect(OWNER_COOKIE_OPTIONS.maxAge).toBe(60 * 60 * 24 * 30);
  });
});

describe("resolveSession", () => {
  it("reuses a valid scope", async () => {
    const ownerId = "a".repeat(32);
    cookieJar.set(OWNER_COOKIE, ownerId);

    const session = await resolveSession();

    expect(session).toEqual({ ownerId, isNew: false });
  });

  it("mints a scope when there is no cookie", async () => {
    const session = await resolveSession();

    expect(session.isNew).toBe(true);
    expect(isValidOwner(session.ownerId)).toBe(true);
  });

  it("does not trust a scope that is not valid", async () => {
    // The cookie is the only thing that decides row ownership, so a tampered
    // value must be replaced rather than used. "not-a-valid-scope" would in
    // fact pass the pattern - the alphabet allows dashes - so the tampered
    // value here is one that cannot be a minted id at all.
    cookieJar.set(OWNER_COOKIE, "short");

    const session = await resolveSession();

    expect(session.isNew).toBe(true);
    expect(session.ownerId).not.toBe("short");
    expect(isValidOwner(session.ownerId)).toBe(true);
  });
});

describe("scopeMatches", () => {
  it("matches an equal scope", () => {
    const scope = "a".repeat(32);
    expect(scopeMatches(scope, scope)).toBe(true);
  });

  it("does not match a different scope of the same length", () => {
    expect(scopeMatches("a".repeat(32), "b".repeat(32))).toBe(false);
  });

  it("does not match a scope of a different length", () => {
    // timingSafeEqual throws on buffers of different sizes, so the length is
    // checked first - the answer here has to be false, not an exception.
    expect(scopeMatches("a".repeat(32), "a".repeat(31))).toBe(false);
    expect(scopeMatches("", "a")).toBe(false);
  });
});
