import type { Router } from "express";
import { CategoryTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { CategoryRouteDeps } from "./category.route.js";

export const registerCategoryPublicRoutes = (
  router: Router,
  { categoryController, rateLimiter }: CategoryRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(CategoryTypes.ListCategories),
    categoryController.listCategories,
  );

  router.get(
    "/top",
    rateLimiter,
    validateMultiple(CategoryTypes.ListTopCategories),
    categoryController.listTopCategories,
  );

  router.get(
    "/tree",
    rateLimiter,
    validateMultiple(CategoryTypes.GetCategoryTree),
    categoryController.getCategoryTree,
  );

  router.get(
    "/slug/:slug",
    rateLimiter,
    validateMultiple(CategoryTypes.GetCategoryBySlug),
    categoryController.getCategoryBySlug,
  );

  router.get(
    "/:id",
    rateLimiter,
    validateMultiple(CategoryTypes.GetCategoryById),
    categoryController.getCategoryById,
  );
};
