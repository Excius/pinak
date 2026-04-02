import type { Router } from "express";
import { ProductCategoryTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./route-deps.js";

export const registerProductPublicCategoryRoutes = (
  router: Router,
  { authMiddleware, rateLimiter, productCategoryController }: ProductRouteDeps,
) => {
  router.get(
    "/:productId/categories",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductCategoryTypes.ListCategoriesForProduct),
    productCategoryController.listForProduct,
  );
};

export const registerProductAdminCategoryRoutes = (
  router: Router,
  { authMiddleware, rateLimiter, productCategoryController }: ProductRouteDeps,
) => {
  router.post(
    "/admin/:productId/categories",
    rateLimiter,
    validateMultiple(ProductCategoryTypes.AddProductToCategory),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productCategoryController.add,
  );

  router.delete(
    "/admin/:productId/categories/:categoryId",
    rateLimiter,
    validateMultiple(ProductCategoryTypes.RemoveProductFromCategory),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productCategoryController.remove,
  );

  router.put(
    "/admin/:productId/categories",
    rateLimiter,
    validateMultiple(ProductCategoryTypes.SetCategoriesForProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productCategoryController.setCategories,
  );
};
