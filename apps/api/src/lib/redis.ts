import Redis from "ioredis";
import env from "./config.js";
import logger from "./logger.js";

// Check if REDIS_URL is strictly defined in env, otherwise fallback for dev
const redisUrl = env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis.default(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});

redis.on("connect", () => {
  logger.info("Connected to Redis");
});

export default redis;
