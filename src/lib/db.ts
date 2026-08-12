import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// One PrismaClient for the whole app. In dev, Next.js hot-reload would
// otherwise create a new client (and DB connections) on every file change.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // The local `prisma dev` server handles very few concurrent connections;
    // .env sets this to 1 there. Unset in production (Neon pooler handles it).
    max: process.env.DATABASE_POOL_MAX
      ? Number(process.env.DATABASE_POOL_MAX)
      : undefined,
    // The local server also kills idle connections, which leaves dead sockets
    // in the pool; discard idle connections quickly there.
    idleTimeoutMillis: process.env.DATABASE_POOL_IDLE_MS
      ? Number(process.env.DATABASE_POOL_IDLE_MS)
      : undefined,
  });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
