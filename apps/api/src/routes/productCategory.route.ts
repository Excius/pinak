import { Router } from "express";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { ProductCategoryRepository } from "../repositories/productCategory.repository.js";
import { ProductCategoryService } from "../services/productCategory.service.js";
import { ProductCategoryController } from "../controllers/productCategory.controller.js";
import { prisma } from "../lib/prisma.js";
import { ProductCategoryTypes } from "@repo/types";

const router = Router();
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const repo = new ProductCategoryRepository(prisma);
const service = new ProductCategoryService(repo);
const controller = new ProductCategoryController(service);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

// Admin actions
router.post(
  "/:productId/categories",
  rateLimiter,
  validateMultiple(ProductCategoryTypes.AddProductToCategory),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.add,
);
router.delete(
  "/:productId/categories/:categoryId",
  rateLimiter,
  validateMultiple(ProductCategoryTypes.RemoveProductFromCategory),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.remove,
);
router.put(
  "/:productId/categories",
  rateLimiter,
  validateMultiple(ProductCategoryTypes.SetCategoriesForProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.setCategories,
);
router.get(
  "/:productId/categories",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(ProductCategoryTypes.ListCategoriesForProduct),
  controller.listForProduct,
);

export default router;
