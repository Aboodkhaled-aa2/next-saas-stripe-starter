import { PrismaClient } from "@prisma/client";
import "server-only";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

/**
 * Supabase transaction-pooler connections can move queries between backend
 * connections. PgBouncer compatibility disables Prisma prepared statements
 * for the isolated Demo database connection only.
 */
if (process.env.DEMO_MODE === "true" && process.env.DATABASE_URL) {
  try {
    const demoDatabaseUrl = new URL(process.env.DATABASE_URL);
    demoDatabaseUrl.searchParams.set("pgbouncer", "true");
    process.env.DATABASE_URL = demoDatabaseUrl.toString();
  } catch {
    // Keep the original value so Prisma can report malformed URLs normally.
  }
}

export let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}
