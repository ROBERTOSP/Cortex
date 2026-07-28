import "dotenv/config";
import { defineConfig } from "prisma/config";

function normalizeEnvUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim();
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) return v.slice(1, -1);
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) return v.slice(1, -1);
  return v;
}

function normalizeDatabaseUrl(value: string | undefined): string | undefined {
  const v = normalizeEnvUrl(value);
  if (!v) return undefined;
  if (!v.includes("://")) return undefined;
  return v;
}

function buildUrlWithSchema(
  databaseUrl: string | undefined,
  schemaName: string,
): string | undefined {
  if (!databaseUrl) return undefined;
  const u = new URL(databaseUrl);
  u.searchParams.set("schema", schemaName);
  return u.toString();
}

const baseDatabaseUrl = normalizeDatabaseUrl(process.env["DATABASE_URL"]);
const migrateDatabaseUrl =
  normalizeDatabaseUrl(process.env["PRISMA_MIGRATE_DATABASE_URL"]) ?? baseDatabaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrateDatabaseUrl,
    shadowDatabaseUrl:
      normalizeDatabaseUrl(process.env["SHADOW_DATABASE_URL"]) ??
      buildUrlWithSchema(baseDatabaseUrl, "_prisma_shadow_dev"),
  },
});
