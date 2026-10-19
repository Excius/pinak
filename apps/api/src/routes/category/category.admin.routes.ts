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
  router.get(
    "/admin/:categoryId/images",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.AdminGetCategoryImages),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
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
    validateMultiple(CategoryAdminTypes.SetPrimaryCategoryImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.setPrimaryImage,
  );

  router.delete(
    "/admin/images/:id",
    rateLimiter,
    validateMultiple(CategoryAdminTypes.DeleteCategoryImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    categoryController.deleteImage,
  );
};
