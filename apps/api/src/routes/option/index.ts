import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { OptionController } from "../../controllers/option.controller.js";
import { OptionRepository } from "../../repositories/option.repository.js";
import { OptionService } from "../../services/option.service.js";
import { registerOptionAdminRoutes } from "./admin.routes.js";
import { registerOptionPublicRoutes } from "./public.routes.js";

export type OptionRouteDeps = {
  optionController: OptionController;
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

const repo = new OptionRepository(prisma);
const service = new OptionService(repo);
const optionController = new OptionController(service);

const deps: OptionRouteDeps = {
  optionController,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerOptionAdminRoutes(router, deps);
registerOptionPublicRoutes(router, deps);

export default router;
