import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { PageRepository } from "../../repositories/page.repository.js";
import { PageService } from "../../services/page.service.js";
import { PageController } from "../../controllers/page.controller.js";
import { registerPagePublicRoutes } from "./public.routes.js";
import { registerPageAdminRoutes } from "./admin.routes.js";

export type PageRouteDeps = {
  pageController: PageController;
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

const pageRepository = new PageRepository(prisma);
const pageService = new PageService(pageRepository);
const pageController = new PageController(pageService);

const deps: PageRouteDeps = {
  pageController,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerPagePublicRoutes(router, deps);
registerPageAdminRoutes(router, deps);

export default router;
