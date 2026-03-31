import { Router } from "express";
import { CategoryController } from "../controllers/category.controller.js";
import { CategoryRepository } from "../repositories/category.repository.js";
import { CategoryService } from "../services/category.service.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { validateMultiple } from "../lib/validation.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { CategoryTypes } from "@repo/types";

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

// ── Public routes ─────────────────────────────────────────────────────────────

/** GET /categories — list all or filter by parentId */
router.get(
  "/",
  rateLimiter,
  validateMultiple(CategoryTypes.ListCategories),
  categoryController.listCategories,
);

/** GET /categories/tree — full nested tree */
router.get(
  "/tree",
  rateLimiter,
  validateMultiple(CategoryTypes.GetCategoryTree),
  categoryController.getCategoryTree,
);

/** GET /categories/slug/:slug */
router.get(
  "/slug/:slug",
  rateLimiter,
  validateMultiple(CategoryTypes.GetCategoryBySlug),
  categoryController.getCategoryBySlug,
);

/** GET /categories/:id */
router.get(
  "/:id",
  rateLimiter,
  validateMultiple(CategoryTypes.GetCategoryById),
  categoryController.getCategoryById,
);

// ── Admin routes ───────────────────────────────────────────────────────────────

/** POST /categories — create a new category */
router.post(
  "/",
  rateLimiter,
  validateMultiple(CategoryTypes.CreateCategory),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  categoryController.createCategory,
);

/** PUT /categories/:id — update an existing category */
router.put(
  "/:id",
  rateLimiter,
  validateMultiple(CategoryTypes.UpdateCategory),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  categoryController.updateCategory,
);

/** DELETE /categories/:id — delete a category (protected; rejects if linked) */
router.delete(
  "/:id",
  rateLimiter,
  validateMultiple(CategoryTypes.DeleteCategory),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  categoryController.deleteCategory,
);

export default router;
