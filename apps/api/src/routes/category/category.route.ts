import { Router } from "express";
import { CategoryController } from "../../controllers/category.controller.js";
import { CategoryRepository } from "../../repositories/category.repository.js";
import { CategoryService } from "../../services/category.service.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { registerCategoryPublicRoutes } from "./category.public.routes.js";
import { registerCategoryAdminRoutes } from "./category.admin.routes.js";

export type CategoryRouteDeps = {
  categoryController: CategoryController;
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
const categoryRepository = new CategoryRepository(prisma);
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

const deps: CategoryRouteDeps = {
  categoryController,
  authMiddleware,
  rateLimiter,
};

registerCategoryPublicRoutes(router, deps);
registerCategoryAdminRoutes(router, deps);

export default router;
