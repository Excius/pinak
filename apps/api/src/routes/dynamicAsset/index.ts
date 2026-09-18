import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { DynamicAssetRepository } from "../../repositories/dynamicAsset.repository.js";
import { DynamicAssetService } from "../../services/dynamicAsset.service.js";
import { DynamicAssetController } from "../../controllers/dynamicAsset.controller.js";
import { registerDynamicAssetPublicRoutes } from "./public.routes.js";
import { registerDynamicAssetAdminRoutes } from "./admin.routes.js";

export type DynamicAssetRouteDeps = {
  controller: DynamicAssetController;
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
const repo = new DynamicAssetRepository(prisma);
const service = new DynamicAssetService(repo);
const controller = new DynamicAssetController(service);

const deps: DynamicAssetRouteDeps = {
  controller,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerDynamicAssetPublicRoutes(router, deps);
registerDynamicAssetAdminRoutes(router, deps);

export default router;
