import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { SettingRepository } from "../../repositories/setting.repository.js";
import { SettingService } from "../../services/setting.service.js";
import { SettingController } from "../../controllers/setting.controller.js";
import { registerSettingPublicRoutes } from "./public.routes.js";
import { registerSettingAdminRoutes } from "./admin.routes.js";

export type SettingRouteDeps = {
  settingController: SettingController;
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

const settingRepository = new SettingRepository(prisma);
const settingService = new SettingService(settingRepository);
const settingController = new SettingController(settingService);

const deps: SettingRouteDeps = {
  settingController,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerSettingPublicRoutes(router, deps);
registerSettingAdminRoutes(router, deps);

export default router;
