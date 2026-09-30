/**
 * Repository access layer.
 *
 * Two adapters behind one interface:
 *   - Neon Postgres  (production, requires DATABASE_URL)
 *   - PGlite         (zero-config local dev + tests, embedded WASM Postgres)
 *
 * Both speak the same SQL, so the schema, queries, indexes and transactions are
 * written once. PGlite is never selected in production: the adapter selection
 * below throws if NODE_ENV === "production" without a real DATABASE_URL.
 */

import type {
  AuditEvent,
  CreateSpecInput,
  MotionSpec,
  UpdateSpecInput,
} from "./types";
import { GENESIS_SEAL, sealEvent } from "./integrity";
import { randomUUID } from "node:crypto";

export type SqlExecutor = {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  /** Run one or more statements that take no parameters (DDL). */
  exec(sql: string): Promise<void>;
};

/**
 * Resolve the production connection string.
 *
 * `DATABASE_URL` is the documented name. `POSTGRES_URL` is accepted as a
 * fallback because that is what the Vercel Postgres and Neon marketplace
 * integrations provision, and a deploy should not need a manual copy-paste
 * when the database is already wired up.
 */
export function resolveDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || undefined;
}

/**
 * Postgres schema to place Folio Motion tables in.
 *
 * Defaults to `public`, which is correct for a fresh database. Deployments that
 * share one Postgres instance with another application can set
 * `DATABASE_SCHEMA` to namespace their tables instead of colliding.
 *
 * The value is interpolated into DDL, so it is validated against a strict
 * identifier pattern before use. Anything that does not look like a plain
 * unquoted Postgres identifier is rejected outright.
 */
const SCHEMA_PATTERN = /^[a-z_][a-z0-9_]{0,62}$/;

export function resolveSchema(): string {
  const raw = process.env.DATABASE_SCHEMA?.trim();
  if (!raw) return "public";
  if (!SCHEMA_PATTERN.test(raw)) {
    throw new Error(
      `DATABASE_SCHEMA must match ${SCHEMA_PATTERN} (lowercase letters, digits and underscores, not starting with a digit).`,
    );
  }
  return raw;
}

export interface Repository {
  readonly kind: "neon-postgres" | "pglite-embedded";
  init(): Promise<void>;
  createSpec(ownerId: string, input: CreateSpecInput): Promise<MotionSpec>;
  listSpecs(ownerId: string, limit: number, offset: number): Promise<{ items: MotionSpec[]; total: number }>;
  getSpec(ownerId: string, id: string): Promise<MotionSpec | null>;
  updateSpec(ownerId: string, id: string, input: UpdateSpecInput): Promise<MotionSpec | null>;
  deleteSpec(ownerId: string, id: string): Promise<MotionSpec | null>;
  appendAudit(specId: string, action: AuditEvent["action"], payload: unknown, ownerId: string): Promise<AuditEvent>;
  listAudit(specId?: string): Promise<AuditEvent[]>;
  headSeal(specId?: string): Promise<string>;
  findByIdempotencyKey(ownerId: string, key: string): Promise<MotionSpec | null>;
  health(): Promise<{ ok: boolean; detail: string }>;
  close(): Promise<void>;
}

/**
 * Schema DDL. `schema` is validated by `resolveSchema()` before it is
 * interpolated here, so it can only ever be a plain identifier.
 */
function schemaSql(schema: string): string {
  return `
CREATE SCHEMA IF NOT EXISTS ${schema};
SET search_path TO ${schema};

CREATE TABLE IF NOT EXISTS motion_specs (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  target        TEXT NOT NULL,
  kind          TEXT NOT NULL,
  params        JSONB NOT NULL,
  owner_id      TEXT NOT NULL,
  idempotency_key TEXT,
  deleted       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_specs_owner ON motion_specs (owner_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_specs_idem ON motion_specs (owner_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS audit_events (
  seq         BIGSERIAL PRIMARY KEY,
  id          TEXT NOT NULL UNIQUE,
  spec_id     TEXT NOT NULL,
  owner_id    TEXT NOT NULL,
  action      TEXT NOT NULL,
  payload     TEXT NOT NULL,
  prev_seal   TEXT NOT NULL,
  seal        TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_spec ON audit_events (spec_id, seq ASC);
CREATE INDEX IF NOT EXISTS idx_audit_seq ON audit_events (seq ASC);
`;
}

function rowToSpec(row: Record<string, unknown>): MotionSpec {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    target: row.target as MotionSpec["target"],
    params: row.params as MotionSpec["params"],
    ownerId: String(row.owner_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deleted: Boolean(row.deleted),
  };
}

/**
 * Shared SQL implementation. `db` is whatever the adapter's query function
 * talks to; the SQL is identical for Neon and PGlite.
 */
function makeRepository(kind: Repository["kind"], db: SqlExecutor): Repository {
  const exec = (sql: string, params?: unknown[]) => db.query(sql, params);
  const schema = resolveSchema();

  return {
    kind,

    async init() {
      // DDL is a multi-statement script, so it goes through exec() rather than
      // the parameterised query path (which allows only one statement).
      await db.exec(schemaSql(schema));
    },

    async createSpec(ownerId, input) {
      if (input.idempotencyKey) {
        const existing = await this.findByIdempotencyKey(ownerId, input.idempotencyKey);
        if (existing) return existing;
      }
      const id = randomUUID();
      const now = new Date().toISOString();
      const params = JSON.stringify(input.params);
      await exec(
        `INSERT INTO ${schema}.motion_specs (id, name, description, target, kind, params, owner_id, idempotency_key, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $9)`,
        [id, input.name, input.description ?? "", input.target, input.params.kind, params, ownerId, input.idempotencyKey ?? null, now],
      );
      return {
        id,
        name: input.name,
        description: input.description ?? "",
        target: input.target,
        params: input.params,
        ownerId,
        createdAt: now,
        updatedAt: now,
        deleted: false,
      };
    },

    async listSpecs(ownerId, limit, offset) {
      const rows = await exec(
        `SELECT * FROM ${schema}.motion_specs WHERE owner_id = $1 AND deleted = FALSE
         ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [ownerId, limit, offset],
      );
      const count = await exec(
        `SELECT COUNT(*)::int AS total FROM ${schema}.motion_specs WHERE owner_id = $1 AND deleted = FALSE`,
        [ownerId],
      );
      const totalRow = count.rows[0] as { total?: number } | undefined;
      return {
        items: rows.rows.map(rowToSpec),
        total: totalRow?.total ?? 0,
      };
    },

    async getSpec(ownerId, id) {
      // Soft-deleted specs are invisible to normal reads; the tombstone row
      // still exists so the audit chain stays replayable.
      const res = await exec(
        `SELECT * FROM ${schema}.motion_specs WHERE id = $1 AND owner_id = $2 AND deleted = FALSE`,
        [id, ownerId],
      );
      const row = res.rows[0];
      return row ? rowToSpec(row) : null;
    },

    async updateSpec(ownerId, id, input) {
      const current = await this.getSpec(ownerId, id);
      if (!current || current.deleted) return null;
      const now = new Date().toISOString();
      const nextParams = input.params ?? current.params;
      await exec(
        `UPDATE ${schema}.motion_specs
            SET name = $1, description = $2, target = $3, kind = $4, params = $5::jsonb, updated_at = $6
          WHERE id = $7 AND owner_id = $8`,
        [
          input.name ?? current.name,
          input.description ?? current.description,
          input.target ?? current.target,
          nextParams.kind,
          JSON.stringify(nextParams),
          now,
          id,
          ownerId,
        ],
      );
      return {
        ...current,
        name: input.name ?? current.name,
        description: input.description ?? current.description,
        target: input.target ?? current.target,
        params: nextParams,
        updatedAt: now,
      };
    },

    async deleteSpec(ownerId, id) {
      const current = await this.getSpec(ownerId, id);
      if (!current || current.deleted) return null;
      const now = new Date().toISOString();
      // Soft delete: the row survives so the audit chain stays replayable.
      await exec(`UPDATE ${schema}.motion_specs SET deleted = TRUE, updated_at = $1 WHERE id = $2 AND owner_id = $3`, [
        now,
        id,
        ownerId,
      ]);
      return { ...current, deleted: true, updatedAt: now };
    },

    async appendAudit(specId, action, payload, ownerId) {
      // Per-entity chain: every spec's audit trail starts from genesis and is
      // independent of every other spec's history.
      const prevSeal = await this.headSeal(specId);
      const event = sealEvent(prevSeal, {
        id: randomUUID(),
        specId,
        action,
        payload: JSON.stringify(payload ?? null),
        prevSeal,
        createdAt: new Date().toISOString(),
      });
      await exec(
        `INSERT INTO ${schema}.audit_events (id, spec_id, owner_id, action, payload, prev_seal, seal, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [event.id, specId, ownerId, action, event.payload, event.prevSeal, event.seal, event.createdAt],
      );
      return event;
    },

    async listAudit(specId) {
      const res = specId
        ? await exec(`SELECT * FROM ${schema}.audit_events WHERE spec_id = $1 ORDER BY seq ASC`, [specId])
        : await exec(`SELECT * FROM ${schema}.audit_events ORDER BY seq ASC`);
      return res.rows.map(
        (r): AuditEvent => ({
          id: String(r.id),
          specId: String(r.spec_id),
          action: r.action as AuditEvent["action"],
          payload: String(r.payload),
          seal: String(r.seal),
          prevSeal: String(r.prev_seal),
          createdAt: String(r.created_at),
        }),
      );
    },

    async headSeal(specId) {
      const res = specId
        ? await exec(`SELECT seal FROM ${schema}.audit_events WHERE spec_id = $1 ORDER BY seq DESC LIMIT 1`, [specId])
        : await exec(`SELECT seal FROM ${schema}.audit_events ORDER BY seq DESC LIMIT 1`);
      const row = res.rows[0] as { seal?: string } | undefined;
      return row?.seal ?? GENESIS_SEAL;
    },

    async findByIdempotencyKey(ownerId, key) {
      const res = await exec(
        `SELECT * FROM ${schema}.motion_specs WHERE owner_id = $1 AND idempotency_key = $2 LIMIT 1`,
        [ownerId, key],
      );
      const row = res.rows[0];
      return row ? rowToSpec(row) : null;
    },

    async health() {
      try {
        const res = await exec(`SELECT 1 AS ok`);
        const row = res.rows[0] as { ok?: number } | undefined;
        if (row?.ok === 1) return { ok: true, detail: "SELECT 1 succeeded" };
        return { ok: false, detail: "health query returned no rows" };
      } catch (err) {
        return { ok: false, detail: err instanceof Error ? err.message : "unknown database error" };
      }
    },

    async close() {
      /* PGlite is a singleton in this process; nothing to close for Neon. */
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Neon adapter (production)                                                  */
/* -------------------------------------------------------------------------- */

let neonRepo: Repository | null = null;

async function getNeonRepository(): Promise<Repository> {
  if (neonRepo) return neonRepo;
  const url = resolveDatabaseUrl();
  if (!url) {
    throw new Error(
      "No production database configured. Set DATABASE_URL (or POSTGRES_URL, which the Vercel/Neon integrations provide) to a hosted Postgres connection string; Folio Motion will not fall back to an embedded database in production.",
    );
  }
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  const executor: SqlExecutor = {
    async query<T>(statement: string, params: unknown[] = []) {
      const result = (await sql.query(statement, params as never[])) as unknown;
      const rows = (result as { rows?: T[] }).rows;
      return { rows: Array.isArray(rows) ? rows : [] };
    },
    async exec(statement: string) {
      // Neon's query() accepts a multi-statement script and no parameters.
      await sql.query(statement, [] as never[]);
    },
  };
  neonRepo = makeRepository("neon-postgres", executor);
  return neonRepo;
}

/* -------------------------------------------------------------------------- */
/* PGlite adapter (zero-config local + tests)                                  */
/* -------------------------------------------------------------------------- */

let pgliteRepo: Repository | null = null;
let pgliteInit: Promise<Repository> | null = null;

async function getPgliteRepository(): Promise<Repository> {
  if (pgliteRepo) return pgliteRepo;
  if (pgliteInit) return pgliteInit;

  pgliteInit = (async () => {
    const { PGlite } = await import("@electric-sql/pglite");
    const client = await PGlite.create();
    const executor: SqlExecutor = {
      async query<T>(statement: string, params: unknown[] = []) {
        const result = await client.query<T>(statement, params as never[]);
        return { rows: result.rows };
      },
      async exec(statement: string) {
        // PGlite's exec() runs a multi-statement script.
        await client.exec(statement);
      },
    };
    pgliteRepo = makeRepository("pglite-embedded", executor);
    return pgliteRepo;
  })();

  return pgliteInit;
}

/**
 * Adapter selection. Production must never silently fall back to an embedded
 * database: that would lose every user's spec on the next cold start.
 */
export async function getRepository(): Promise<Repository> {
  const isProduction = process.env.NODE_ENV === "production";
  const hasDatabaseUrl = Boolean(resolveDatabaseUrl());

  if (isProduction) {
    if (!hasDatabaseUrl) {
      throw new Error(
        "Refusing to start in production without a database connection string. Set DATABASE_URL " +
          "(or POSTGRES_URL). Folio Motion will not fall back to an embedded database in production, " +
          "because that would silently lose every saved spec on the next cold start.",
      );
    }
    return getNeonRepository();
  }

  if (hasDatabaseUrl) return getNeonRepository();
  return getPgliteRepository();
}

export { makeRepository };
