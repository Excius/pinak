import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Response, Request } from "express";
import logger from "./logger.js";
import { ResponseHandler } from "./response.js";
import appConfig from "./config.js";

// IPv6-safe key generation using `ipKeyGenerator` from `express-rate-limit`

/**
 * Rate limiting configuration for the API
 */
export const createRateLimiter = () => {
  return rateLimit({
    windowMs: appConfig.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    max: appConfig.RATE_LIMIT_MAX,
    keyGenerator: (req: Request) => {
      const userId = (req as Request & { user?: { id?: string } }).user?.id;
      return userId ? `user:${String(userId)}` : ipKeyGenerator(String(req.ip));
    },
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
      const userId = (req as Request & { user?: { id?: string } }).user?.id;
      const key = userId
        ? `user:${String(userId)}`
        : ipKeyGenerator(String(req.ip));
      logger.warn(`Rate limit exceeded for key: ${key}`);
      ResponseHandler.tooManyRequests(
        res,
        "Too many requests, please try again later.",
      );
    },
  });
};

/**
 * Stricter rate limiting for authentication routes
 */
export const createAuthRateLimiter = () => {
  return rateLimit({
    windowMs: appConfig.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    max: appConfig.AUTH_RATE_LIMIT_MAX,
    keyGenerator: (req: Request) => {
      const userId = (req as Request & { user?: { id?: string } }).user?.id;
      return userId ? `user:${String(userId)}` : ipKeyGenerator(String(req.ip));
    },
    message: {
      success: false,
      message: "Too many authentication attempts, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      const userId = (req as Request & { user?: { id?: string } }).user?.id;
      const key = userId
        ? `user:${String(userId)}`
        : ipKeyGenerator(String(req.ip));
      logger.warn(`Auth rate limit exceeded for key: ${key}`);
      ResponseHandler.tooManyRequests(
        res,
        "Too many authentication attempts, please try again later.",
      );
    },
  });
};
