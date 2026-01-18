import rateLimit from "express-rate-limit";
import { Response } from "express";
import logger from "./logger.js";
import { ResponseHandler } from "./response.js";

/**
 * Rate limiting configuration for the API
 */
export const createRateLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 600, // Limit each IP to 600 requests per windowMs
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res: Response) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      ResponseHandler.tooManyRequests(
        res,
        "Too many requests from this IP, please try again later.",
      );
    },
  });
};
