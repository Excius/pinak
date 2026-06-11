import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import JWTService from "../lib/jwt.js";
import logger from "../lib/logger.js";
import { UserRoles } from "@repo/types";

export class AuthMiddleware {
  constructor(private jwt: JWTService) {}

  authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;
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
      logger.error({ err: error }, "Authentication error:");
      return ResponseHandler.unauthorized(res, "Invalid token");
    }
  };

  requireRole = (allowedRoles: UserRoles[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return ResponseHandler.unauthorized(res, "Authentication required");
      }

      if (!allowedRoles.includes(req.user.role as UserRoles)) {
        return ResponseHandler.forbidden(
          res,
          `Access requires one of: ${allowedRoles.join(", ")}`,
        );
      }

      next();
    };
  };

  requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, "Authentication required");
    }

    if (req.user.role !== "ADMIN") {
      return ResponseHandler.forbidden(res, "Admin access required");
    }

    next();
  };

  requireModeratorOrAdmin = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, "Authentication required");
    }

    if (!["ADMIN", "MODERATOR"].includes(req.user.role)) {
      return ResponseHandler.forbidden(
        res,
        "Moderator or Admin access required",
      );
    }

    next();
  };
}
