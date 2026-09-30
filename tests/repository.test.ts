import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { makeRepository, type Repository, type SqlExecutor } from "@/lib/repository";
import { replayAllChains, replayChain } from "@/lib/integrity";
import type { SpringParams } from "@/lib/types";

const params: SpringParams = {
  kind: "spring",
  stiffness: 180,
  damping: 22,
  mass: 1,
  displacement: 100,
};

let repo: Repository;
let client: import("@electric-sql/pglite").PGlite | null = null;
const owner = "test-owner";

beforeAll(async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  client = await PGlite.create();
  const executor: SqlExecutor = {
    async query<T>(statement: string, values: unknown[] = []) {
      const result = await (client as NonNullable<typeof client>).query<T>(statement, values as never[]);
      return { rows: result.rows };
    },
    async exec(statement: string) {
      await (client as NonNullable<typeof client>).exec(statement);
    },
  };
  repo = makeRepository("pglite-embedded", executor);
  await repo.init();
});

afterAll(async () => {
  await client?.close();
  client = null;
});

describe("repository schema", () => {
  it("is idempotent across repeated initialisation", async () => {
    await repo.init();
    await repo.init();
    const health = await repo.health();
    expect(health.ok).toBe(true);
  });
});

describe("spec CRUD", () => {
  it("creates, reads, updates and soft-deletes a spec", async () => {
    const created = await repo.createSpec(owner, { name: "Demo", target: "translate", params });
    expect(created.id).toBeTruthy();
    expect(created.deleted).toBe(false);
    expect(created.params).toEqual(params);

    const fetched = await repo.getSpec(owner, created.id);
    expect(fetched?.name).toBe("Demo");

    const updated = await repo.updateSpec(owner, created.id, { name: "Renamed" });
    expect(updated?.name).toBe("Renamed");
    expect(updated?.params).toEqual(params);

    const deleted = await repo.deleteSpec(owner, created.id);
    expect(deleted?.deleted).toBe(true);

    // Soft-deleted specs are hidden from normal reads.
    expect(await repo.getSpec(owner, created.id)).toBeNull();
  });

  it("returns null for an unknown id", async () => {
    expect(await repo.getSpec(owner, "00000000-0000-0000-0000-000000000000")).toBeNull();
  });

  it("refuses updates to a spec owned by someone else", async () => {
    const created = await repo.createSpec("owner-a", { name: "Private", target: "scale", params });
    expect(await repo.updateSpec("owner-b", created.id, { name: "Hijacked" })).toBeNull();
    expect(await repo.getSpec("owner-a", created.id)).not.toBeNull();
  });

  it("isolates lists between owners", async () => {
    await repo.createSpec("owner-x", { name: "X1", target: "opacity", params });
    await repo.createSpec("owner-x", { name: "X2", target: "opacity", params });
    const mine = await repo.listSpecs("owner-x", 50, 0);
    const theirs = await repo.listSpecs("owner-y", 50, 0);
    expect(mine.total).toBe(2);
    expect(theirs.total).toBe(0);
  });

  it("paginates with a bounded, correct total", async () => {
    for (let i = 0; i < 3; i++) {
      await repo.createSpec("owner-p", { name: `P${i}`, target: "rotate", params });
    }
    const page = await repo.listSpecs("owner-p", 2, 0);
    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(3);
  });

  it("excludes soft-deleted specs from the list and total", async () => {
    const a = await repo.createSpec("owner-d", { name: "Keep", target: "scale", params });
    const b = await repo.createSpec("owner-d", { name: "Drop", target: "scale", params });
    await repo.deleteSpec("owner-d", b.id);
    const list = await repo.listSpecs("owner-d", 50, 0);
    expect(list.total).toBe(1);
    expect(list.items[0]?.id).toBe(a.id);
  });

  it("honours an idempotency key instead of creating duplicates", async () => {
    const key = "idem-key-12345678";
    const first = await repo.createSpec(owner, {
      name: "Idem",
      target: "translate",
      params,
      idempotencyKey: key,
    });
    const second = await repo.createSpec(owner, {
      name: "Idem",
      target: "translate",
      params,
      idempotencyKey: key,
    });
    expect(second.id).toBe(first.id);
  });
});

describe("audit chain", () => {
  it("appends events whose replay is clean", async () => {
    const spec = await repo.createSpec("owner-audit", { name: "Audited", target: "translate", params });
    await repo.appendAudit(spec.id, "created", { spec }, "owner-audit");
    await repo.appendAudit(spec.id, "updated", { name: "x" }, "owner-audit");
    await repo.appendAudit(spec.id, "deleted", { tombstone: spec.id }, "owner-audit");

    const events = await repo.listAudit(spec.id);
    expect(events).toHaveLength(3);
    const replay = replayChain(events);
    expect(replay.ok).toBe(true);
    expect(replay.checked).toBe(3);
  });

  it("links every event to the previous seal", async () => {
    const spec = await repo.createSpec("owner-link", { name: "Link", target: "translate", params });
    await repo.appendAudit(spec.id, "created", {}, "owner-link");
    await repo.appendAudit(spec.id, "updated", {}, "owner-link");
    const events = await repo.listAudit(spec.id);
    expect(events[0]!.prevSeal).toBe("0".repeat(96));
    expect(events[1]!.prevSeal).toBe(events[0]!.seal);
  });

  it("starts every spec's chain at genesis, independently of other specs", async () => {
    const other = await repo.createSpec("owner-other", { name: "Other", target: "translate", params });
    await repo.appendAudit(other.id, "created", {}, "owner-other");

    const spec = await repo.createSpec("owner-link", { name: "Link", target: "translate", params });
    const first = await repo.appendAudit(spec.id, "created", {}, "owner-link");
    expect(first.prevSeal).toBe("0".repeat(96));

    const second = await repo.appendAudit(spec.id, "updated", {}, "owner-link");
    expect(second.prevSeal).toBe(first.seal);
  });

  it("verifies every per-entity chain independently", async () => {
    const a = await repo.createSpec("owner-multi", { name: "A", target: "translate", params });
    const b = await repo.createSpec("owner-multi", { name: "B", target: "scale", params });
    await repo.appendAudit(a.id, "created", {}, "owner-multi");
    await repo.appendAudit(b.id, "created", {}, "owner-multi");
    await repo.appendAudit(a.id, "updated", {}, "owner-multi");

    const all = await repo.listAudit();
    const grouped = replayAllChains(all);
    expect(grouped.ok).toBe(true);
    expect(grouped.brokenChains).toHaveLength(0);
  });
});
