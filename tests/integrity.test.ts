import { describe, expect, it } from "vitest";
import { canonicalJson, computeSeal, GENESIS_SEAL, replayChain, sealEvent, sha384Hex } from "@/lib/integrity";
import type { AuditEvent } from "@/lib/types";

function makeEvent(seq: number): Omit<AuditEvent, "seal"> {
  return {
    id: `event-${seq}`,
    specId: "spec-1",
    action: seq === 0 ? "created" : "updated",
    payload: JSON.stringify({ seq, note: "payload " + seq }),
    prevSeal: "",
    createdAt: new Date(1700000000000 + seq * 1000).toISOString(),
  };
}

/** Build a valid chain of `length` events. */
function buildChain(length: number): AuditEvent[] {
  const events: AuditEvent[] = [];
  let prev = GENESIS_SEAL;
  for (let i = 0; i < length; i++) {
    const base = makeEvent(i);
    const event = sealEvent(prev, { ...base, prevSeal: prev });
    events.push(event);
    prev = event.seal;
  }
  return events;
}

describe("canonicalJson", () => {
  it("sorts object keys recursively", () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it("is stable regardless of key insertion order", () => {
    const one = canonicalJson({ z: 1, m: { q: 2, b: 3 }, a: 4 });
    const two = canonicalJson({ a: 4, m: { b: 3, q: 2 }, z: 1 });
    expect(one).toBe(two);
  });

  it("preserves array order", () => {
    expect(canonicalJson([3, 1, 2])).toBe("[3,1,2]");
  });

  it("renders primitives and null correctly", () => {
    expect(canonicalJson(null)).toBe("null");
    expect(canonicalJson(42)).toBe("42");
    expect(canonicalJson("x")).toBe('"x"');
    expect(canonicalJson(true)).toBe("true");
  });

  it("replaces non-finite numbers with null instead of emitting invalid JSON", () => {
    expect(canonicalJson(Number.NaN)).toBe("null");
    expect(canonicalJson(Number.POSITIVE_INFINITY)).toBe("null");
  });

  it("omits undefined properties", () => {
    expect(canonicalJson({ a: 1, b: undefined })).toBe('{"a":1}');
  });

  it("serializes dates as ISO strings", () => {
    expect(canonicalJson(new Date(0))).toBe('"1970-01-01T00:00:00.000Z"');
  });

  it("produces parseable JSON for a nested structure", () => {
    const value = { a: [1, { b: 2, c: [3, null] }], d: "e" };
    expect(JSON.parse(canonicalJson(value))).toEqual(value);
  });
});

describe("sha384Hex", () => {
  it("produces a 96-character hex digest", () => {
    const digest = sha384Hex("hello");
    expect(digest).toHaveLength(96);
    expect(digest).toMatch(/^[0-9a-f]{96}$/);
  });

  it("matches the known SHA-384 digest of the empty string", () => {
    // Reference vector from FIPS 180-4.
    expect(sha384Hex("")).toBe(
      "38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b",
    );
  });
});

describe("sealEvent / computeSeal", () => {
  it("chains from the genesis seal", () => {
    const event = sealEvent(GENESIS_SEAL, { ...makeEvent(0), prevSeal: GENESIS_SEAL });
    expect(event.prevSeal).toBe(GENESIS_SEAL);
    expect(event.seal).toHaveLength(96);
  });

  it("is a pure function of prevSeal plus canonical payload", () => {
    const base = { ...makeEvent(0), prevSeal: "abc" };
    expect(computeSeal("abc", base)).toBe(computeSeal("abc", base));
  });

  it("changes when the previous seal changes", () => {
    const base = { ...makeEvent(0), prevSeal: "abc" };
    expect(computeSeal("abc", base)).not.toBe(computeSeal("abd", { ...base, prevSeal: "abd" }));
  });

  it("changes when any payload field is tampered with", () => {
    const original = sealEvent(GENESIS_SEAL, { ...makeEvent(0), prevSeal: GENESIS_SEAL });
    const tamperedAction = sealEvent(GENESIS_SEAL, {
      ...makeEvent(0),
      action: "deleted",
      prevSeal: GENESIS_SEAL,
    });
    expect(original.seal).not.toBe(tamperedAction.seal);
  });
});

describe("replayChain", () => {
  it("passes for an empty chain", () => {
    const result = replayChain([]);
    expect(result.ok).toBe(true);
    expect(result.checked).toBe(0);
    expect(result.headSeal).toBe(GENESIS_SEAL);
  });

  it("passes for a valid chain and reports the head seal", () => {
    const events = buildChain(5);
    const result = replayChain(events);
    expect(result.ok).toBe(true);
    expect(result.checked).toBe(5);
    expect(result.firstBrokenAt).toBeNull();
    expect(result.headSeal).toBe(events[4]!.seal);
  });

  it("detects a mutated payload", () => {
    const events = buildChain(4);
    events[2] = { ...events[2]!, payload: JSON.stringify({ tampered: true }) };
    const result = replayChain(events);
    expect(result.ok).toBe(false);
    expect(result.firstBrokenAt).toBe(2);
    expect(result.firstBrokenId).toBe("event-2");
    expect(result.reason).toMatch(/altered/i);
  });

  it("detects a removed event", () => {
    const events = buildChain(5);
    const spliced = [events[0], events[1], events[3], events[4]].filter(Boolean) as AuditEvent[];
    const result = replayChain(spliced);
    expect(result.ok).toBe(false);
    expect(result.firstBrokenAt).toBe(2);
    expect(result.reason).toMatch(/reordered|removed/i);
  });

  it("detects a reordered chain", () => {
    const events = buildChain(4);
    const [a, b] = events;
    const swapped = [b!, a!, ...events.slice(2)];
    const result = replayChain(swapped);
    expect(result.ok).toBe(false);
    expect(result.ok).toBe(false);
  });

  it("detects a forged seal", () => {
    const events = buildChain(3);
    events[1] = { ...events[1]!, seal: "f".repeat(96) };
    const result = replayChain(events);
    expect(result.ok).toBe(false);
    expect(result.firstBrokenAt).toBe(1);
  });

  it("is deterministic across repeated replays", () => {
    const events = buildChain(6);
    const one = replayChain(events);
    const two = replayChain(events);
    expect(one).toEqual(two);
  });

  it("replays identically when rebuilt from scratch", () => {
    const events = buildChain(7);
    const rebuilt = buildChain(7);
    expect(replayChain(events).headSeal).toBe(replayChain(rebuilt).headSeal);
  });
});
