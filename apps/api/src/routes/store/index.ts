import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { StoreRepository } from "../../repositories/store.repository.js";
import { StoreService } from "../../services/store.service.js";
import { StoreController } from "../../controllers/store.controller.js";
import { registerStorePublicRoutes } from "./public.routes.js";
import { registerStoreAdminRoutes } from "./admin.routes.js";

export type StoreRouteDeps = {
  storeController: StoreController;
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

const storeRepository = new StoreRepository(prisma);
const storeService = new StoreService(storeRepository);
const storeController = new StoreController(storeService);

const deps: StoreRouteDeps = {
  storeController,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerStorePublicRoutes(router, deps);
registerStoreAdminRoutes(router, deps);

export default router;
