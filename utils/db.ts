import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add your Supabase pooled connection string to Vercel environment variables."
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  prismaCacheKey: string | undefined;
};

// Bump when the Prisma schema changes so dev picks up a fresh client.
const PRISMA_CLIENT_CACHE_KEY = "property-images-v1";

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 1,
  });

const adapter = new PrismaPg(pool);

if (
  !globalForPrisma.prisma ||
  globalForPrisma.prismaCacheKey !== PRISMA_CLIENT_CACHE_KEY
) {
  globalForPrisma.prisma = new PrismaClient({ adapter });
  globalForPrisma.prismaCacheKey = PRISMA_CLIENT_CACHE_KEY;
}

const prisma = globalForPrisma.prisma;

globalForPrisma.pool = pool;
globalForPrisma.prisma = prisma;

export default prisma;
