import rateLimit from "express-rate-limit";
import { Response, Request } from "express";
import logger from "./logger.js";
import { ResponseHandler } from "./response.js";

/**
 * Rate limiting configuration for the API
 */
export const createRateLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 600, // Limit each IP/user to 600 requests per windowMs
    keyGenerator: (req: Request) => {
      const userId = (req as Request & { user?: { id?: string } }).user?.id;
      return userId ? `user:${String(userId)}` : String(req.ip);
    },
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
      const userId = (req as Request & { user?: { id?: string } }).user?.id;
      const key = userId ? `user:${String(userId)}` : String(req.ip);
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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Limit each IP/user to 5000 requests per windowMs
    keyGenerator: (req: Request) => {
      const userId = (req as Request & { user?: { id?: string } }).user?.id;
      return userId ? `user:${String(userId)}` : String(req.ip);
    },
    message: {
      success: false,
      message: "Too many authentication attempts, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      const userId = (req as Request & { user?: { id?: string } }).user?.id;
      const key = userId ? `user:${String(userId)}` : String(req.ip);
      logger.warn(`Auth rate limit exceeded for key: ${key}`);
      ResponseHandler.tooManyRequests(
        res,
        "Too many authentication attempts, please try again later.",
      );
    },
  });
};
