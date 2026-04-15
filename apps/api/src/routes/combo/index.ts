import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ComboController } from "../../controllers/combo.controller.js";
import { ComboRepository } from "../../repositories/combo.repository.js";
import { ComboService } from "../../services/combo.service.js";
import { registerComboAdminRoutes } from "./admin.routes.js";
import { registerComboPublicRoutes } from "./public.routes.js";

export type ComboRouteDeps = {
  comboController: ComboController;
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

const comboRepository = new ComboRepository(prisma);
const comboService = new ComboService(comboRepository);
const comboController = new ComboController(comboService);

const deps: ComboRouteDeps = {
  comboController,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerComboPublicRoutes(router, deps);
registerComboAdminRoutes(router, deps);

export default router;
