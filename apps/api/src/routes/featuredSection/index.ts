import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { FeaturedSectionRepository } from "../../repositories/featuredSection.repository.js";
import { FeaturedSectionService } from "../../services/featuredSection.service.js";
import { FeaturedSectionController } from "../../controllers/featuredSection.controller.js";
import { registerFeaturedSectionPublicRoutes } from "./public.routes.js";
import { registerFeaturedSectionAdminRoutes } from "./admin.routes.js";

export type FeaturedSectionRouteDeps = {
  controller: FeaturedSectionController;
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
const repo = new FeaturedSectionRepository(prisma);
const service = new FeaturedSectionService(repo);
const controller = new FeaturedSectionController(service);

const deps: FeaturedSectionRouteDeps = {
  controller,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerFeaturedSectionPublicRoutes(router, deps);
registerFeaturedSectionAdminRoutes(router, deps);

export default router;
