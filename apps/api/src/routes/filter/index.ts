import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { FilterController } from "../../controllers/filter.controller.js";
import { FilterRepository } from "../../repositories/filter.repository.js";
import { FilterService } from "../../services/filter.service.js";
import { registerFilterAdminRoutes } from "./admin.routes.js";
import { registerFilterPublicRoutes } from "./public.routes.js";

export type FilterRouteDeps = {
  filterController: FilterController;
  authMiddleware: AuthMiddleware;
  rateLimiter: ReturnType<typeof createRateLimiter>;
};

const router = Router();

const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);

const repo = new FilterRepository(prisma);
const service = new FilterService(repo);
const filterController = new FilterController(service);

const deps: FilterRouteDeps = {
  filterController,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerFilterPublicRoutes(router, deps);
registerFilterAdminRoutes(router, deps);

export default router;
