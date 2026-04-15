import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { TaxClassRepository } from "../../repositories/taxClass.repository.js";
import { TaxClassService } from "../../services/taxClass.service.js";
import { TaxClassController } from "../../controllers/taxClass.controller.js";
import { registerTaxClassAdminRoutes } from "./admin.routes.js";
import { registerTaxClassPublicRoutes } from "./public.routes.js";

export type TaxClassRouteDeps = {
  controller: TaxClassController;
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

const repo = new TaxClassRepository(prisma);
const service = new TaxClassService(repo);
const controller = new TaxClassController(service);

const deps: TaxClassRouteDeps = {
  controller,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerTaxClassAdminRoutes(router, deps);
registerTaxClassPublicRoutes(router, deps);

export default router;
