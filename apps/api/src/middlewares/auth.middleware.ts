import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import JWTService from "../lib/jwt.js";
import loggerInstance from "../lib/logger.js";

export class AuthMiddleware {
  constructor(private jwt: JWTService) {}

  authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return ResponseHandler.unauthorized(res, "No token provided");
    }

    try {
      const payload = this.jwt.verifyAccessToken(token);
      if (!payload) {
        return ResponseHandler.unauthorized(res, "Invalid token");
      }
      req.user = {
        id: payload.sub,
        role: payload.role,
      };
      next();
    } catch (error) {
      loggerInstance.error("Authentication error:", error);
      return ResponseHandler.unauthorized(res, "Invalid token");
    }
  };
}
