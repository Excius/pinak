import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import config from "./config.js";

const connectionString = `${config.DATABASE_URL}`;

// Remote Postgres (e.g. Neon): opening a connection costs ~2s, so we want a few connections
// that stay open and get reused, not a burst of new ones. The pg defaults close idle
// connections after 10s (every quiet moment then pays the reconnect) and never time out a
// connect attempt.
const adapter = new PrismaPg({
  connectionString,
  max: config.DATABASE_POOL_MAX,
  idleTimeoutMillis: 5 * 60 * 1000,
  connectionTimeoutMillis: 20_000,
  keepAlive: true,
});
const prisma = new PrismaClient({
  adapter,
  // Wait longer for a free connection before giving up on starting a transaction.
  transactionOptions: { maxWait: 10_000, timeout: 15_000 },
  // log: ["query", "info", "warn", "error"],
});

export { prisma };
