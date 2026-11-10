import type { Router } from "express";
import multer from "multer";
import { CategoryTypes, CategoryAdminTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { CategoryRouteDeps } from "./category.route.js";

export const registerCategoryAdminRoutes = (
  router: Router,
  { categoryController, authMiddleware, rateLimiter }: CategoryRouteDeps,
) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  }); // 10MB
  // Admin read endpoints (full content)
  router.get(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryAdminTypes.ListCategories),
    categoryController.listCategoriesAdmin,
  );

  router.get(
    "/admin/top",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryAdminTypes.ListCategories),
    categoryController.listTopCategoriesAdmin,
  );

  router.get(
    "/admin/tree",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryAdminTypes.GetCategoryTree),
    categoryController.getCategoryTreeAdmin,
  );

  router.get(
    "/admin/slug/:slug",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryAdminTypes.GetCategoryBySlug),
    categoryController.getCategoryBySlugAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryAdminTypes.GetCategoryById),
    categoryController.getCategoryByIdAdmin,
  );

  // Admin write endpoints
  router.post(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryTypes.CreateCategory),
    categoryController.createCategory,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryTypes.UpdateCategory),
    categoryController.updateCategory,
  );

  router.delete(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryTypes.DeleteCategory),
    categoryController.deleteCategory,
  );

  // Admin image routes
  router.get(
    "/admin/:categoryId/images",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryAdminTypes.AdminGetCategoryImages),
    categoryController.getAllImages,
  );

  router.post(
    "/admin/:categoryId/images",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    upload.single("image"),
    validateMultiple(CategoryAdminTypes.AddCategoryImage),
    categoryController.addCategoryImage,
  );

  router.patch(
    "/admin/images/:imageId/primary",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryAdminTypes.SetPrimaryCategoryImage),
    categoryController.setPrimaryImage,
  );

  router.delete(
    "/admin/images/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(CategoryAdminTypes.DeleteCategoryImage),
    categoryController.deleteImage,
  );
};
