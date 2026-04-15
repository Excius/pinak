import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { BrandRepository } from "../../repositories/brand.repository.js";
import { BrandService } from "../../services/brand.service.js";
import { BrandController } from "../../controllers/brand.controller.js";
import { registerBrandAdminRoutes } from "./admin.routes.js";
import { registerBrandPublicRoutes } from "./public.routes.js";

export type BrandRouteDeps = {
  brandController: BrandController;
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

const brandRepository = new BrandRepository(prisma);
const brandService = new BrandService(brandRepository);
const brandController = new BrandController(brandService);

const deps: BrandRouteDeps = {
  brandController,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerBrandPublicRoutes(router, deps);
registerBrandAdminRoutes(router, deps);

export default router;
