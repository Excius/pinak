import type { Router } from "express";
import { CategoryTypes, CategoryAdminTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { CategoryRouteDeps } from "./category.route.js";

export const registerCategoryAdminRoutes = (
  router: Router,
  { categoryController, authMiddleware, rateLimiter }: CategoryRouteDeps,
) => {
  // Admin read endpoints (full content)
  router.get(
    "/admin",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.ListCategories),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.listCategoriesAdmin,
  );

  router.get(
    "/admin/top",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.ListCategories),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.listTopCategoriesAdmin,
  );

  router.get(
    "/admin/tree",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.GetCategoryTree),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.getCategoryTreeAdmin,
  );

  router.get(
    "/admin/slug/:slug",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.GetCategoryBySlug),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.getCategoryBySlugAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.GetCategoryById),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.getCategoryByIdAdmin,
  );

  // Admin write endpoints
  router.post(
    "/admin",
    rateLimiter,
    validateMultiple(CategoryTypes.CreateCategory),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.createCategory,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    validateMultiple(CategoryTypes.UpdateCategory),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.updateCategory,
  );

  router.delete(
    "/admin/:id",
    rateLimiter,
    validateMultiple(CategoryTypes.DeleteCategory),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.deleteCategory,
  );

  // Admin image routes
  router.post(
    "/admin/:categoryId/images",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.AddCategoryImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.addCategoryImage,
  );

  router.patch(
    "/admin/images/:imageId/primary",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.SetPrimaryCategoryImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.setPrimaryImage,
  );

  router.delete(
    "/admin/images/:id",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.SoftDeleteCategoryImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.softDeleteImage,
  );

  router.patch(
    "/admin/images/:id/restore",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.RestoreCategoryImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.restoreImage,
  );

  router.delete(
    "/admin/images/:id/hard",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.HardDeleteCategoryImage),
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    categoryController.hardDeleteImage,
  );
};
