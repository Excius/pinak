import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import config from "./config.js";

const connectionString = `${config.DATABASE_URL}`;

const adapter = new PrismaPg({
  connectionString,
  max: config.DATABASE_POOL_MAX,
});
const prisma = new PrismaClient({
  adapter,
  transactionOptions: { maxWait: 10_000, timeout: 15_000 },
  // log: ["query", "info", "warn", "error"],
});

export { prisma };
