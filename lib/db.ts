import { PrismaClient } from "@prisma/client";
import "server-only";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

/**
 * Supabase's pooled PostgreSQL connections may route consecutive Prisma
 * queries through different backend connections. Disable prepared statements
 * for the isolated Demo pooler connection to avoid PgBouncer statement errors.
 * Production keeps its existing DATABASE_URL behavior unchanged.
 */
function getPrismaOptions() {
  if (process.env.DEMO_MODE !== "true" || !process.env.DATABASE_URL) {
    return {};
  }

  try {
    const databaseUrl = new URL(process.env.DATABASE_URL);
    databaseUrl.searchParams.set("pgbouncer", "true");

    return {
      datasources: {
        db: {
          url: databaseUrl.toString(),
        },
      },
    };
  } catch {
    // Let Prisma report malformed connection URLs through its normal error path.
    return {};
  }
}

const prismaOptions = getPrismaOptions();

export let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(prismaOptions);
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient(prismaOptions);
  }
  prisma = global.cachedPrisma;
}
