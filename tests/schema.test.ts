import { afterEach, describe, expect, it } from "vitest";
import { resolveDatabaseUrl, resolveSchema } from "@/lib/repository";

const originalSchema = process.env.DATABASE_SCHEMA;
const originalUrl = process.env.DATABASE_URL;
const originalPostgres = process.env.POSTGRES_URL;

afterEach(() => {
  if (originalSchema === undefined) delete process.env.DATABASE_SCHEMA;
  else process.env.DATABASE_SCHEMA = originalSchema;
  if (originalUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalUrl;
  if (originalPostgres === undefined) delete process.env.POSTGRES_URL;
  else process.env.POSTGRES_URL = originalPostgres;
});

describe("resolveDatabaseUrl", () => {
  it("is undefined when nothing is configured", () => {
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_URL;
    expect(resolveDatabaseUrl()).toBeUndefined();
  });

  it("prefers DATABASE_URL when both are set", () => {
    process.env.DATABASE_URL = "postgresql://a/db1";
    process.env.POSTGRES_URL = "postgresql://b/db2";
    expect(resolveDatabaseUrl()).toBe("postgresql://a/db1");
  });

  it("falls back to POSTGRES_URL, which the Vercel/Neon integrations set", () => {
    delete process.env.DATABASE_URL;
    process.env.POSTGRES_URL = "postgresql://b/db2";
    expect(resolveDatabaseUrl()).toBe("postgresql://b/db2");
  });

  it("treats an empty or whitespace value as unset", () => {
    process.env.DATABASE_URL = "   ";
    process.env.POSTGRES_URL = "postgresql://b/db2";
    expect(resolveDatabaseUrl()).toBe("postgresql://b/db2");
  });
});

describe("resolveSchema", () => {
  it("defaults to public when unset", () => {
    delete process.env.DATABASE_SCHEMA;
    expect(resolveSchema()).toBe("public");
  });

  it("defaults to public when empty or whitespace", () => {
    process.env.DATABASE_SCHEMA = "";
    expect(resolveSchema()).toBe("public");
    process.env.DATABASE_SCHEMA = "   ";
    expect(resolveSchema()).toBe("public");
  });

  it("accepts a valid lowercase identifier", () => {
    process.env.DATABASE_SCHEMA = "folio_motion";
    expect(resolveSchema()).toBe("folio_motion");
  });

  it("rejects anything that is not a bare identifier", () => {
    // The value is interpolated into DDL, so injection attempts must throw
    // rather than be sanitized into something surprising.
    const hostile = [
      "public; DROP TABLE motion_specs",
      "a b",
      'a"b',
      "1schema",
      "schema-name",
      "schema.name",
      "public--",
      "public/*",
      "public'",
      "public)",
    ];
    for (const value of hostile) {
      process.env.DATABASE_SCHEMA = value;
      expect(() => resolveSchema(), value).toThrow();
    }
  });

  it("accepts any other bare identifier, including a system schema", () => {
    // A bare identifier cannot carry a payload, so a real schema name is safe
    // even when it is a reserved one. The app never creates it implicitly.
    for (const value of ["public", "pg_catalog", "folio_motion", "fm_v2"]) {
      process.env.DATABASE_SCHEMA = value;
      expect(resolveSchema(), value).toBe(value);
    }
  });

  it("rejects identifiers longer than 63 bytes", () => {
    process.env.DATABASE_SCHEMA = "a".repeat(64);
    expect(() => resolveSchema()).toThrow();
    process.env.DATABASE_SCHEMA = "a".repeat(63);
    expect(resolveSchema()).toBe("a".repeat(63));
  });

  it("rejects uppercase, which Postgres would fold unpredictably here", () => {
    process.env.DATABASE_SCHEMA = "FolioMotion";
    expect(() => resolveSchema()).toThrow();
  });
});
