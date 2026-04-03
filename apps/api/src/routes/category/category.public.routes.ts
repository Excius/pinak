import type { Router } from "express";
import { CategoryTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { CategoryRouteDeps } from "./category.route.js";

export const registerCategoryPublicRoutes = (
  router: Router,
  { categoryController, rateLimiter, authMiddleware }: CategoryRouteDeps,
) => {
  router.get(
    "/",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(CategoryTypes.ListCategories),
    categoryController.listCategories,
  );

  router.get(
    "/top",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(CategoryTypes.ListTopCategories),
    categoryController.listTopCategories,
  );

  router.get(
    "/tree",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(CategoryTypes.GetCategoryTree),
    categoryController.getCategoryTree,
  );

  router.get(
    "/slug/:slug",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(CategoryTypes.GetCategoryBySlug),
    categoryController.getCategoryBySlug,
  );

  router.get(
    "/:id",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(CategoryTypes.GetCategoryById),
    categoryController.getCategoryById,
  );
};
