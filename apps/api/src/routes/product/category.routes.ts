import type { Router } from "express";
import { ProductCategoryTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductPublicCategoryRoutes = (
  router: Router,
  { rateLimiter, productCategoryController }: ProductRouteDeps,
) => {
  router.get(
    "/:productId/categories",
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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductCategoryTypes.AddProductToCategory),
    productCategoryController.add,
  );

  router.delete(
    "/admin/:productId/categories/:categoryId",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductCategoryTypes.RemoveProductFromCategory),
    productCategoryController.remove,
  );

  router.put(
    "/admin/:productId/categories",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductCategoryTypes.SetCategoriesForProduct),
    productCategoryController.setCategories,
  );
};
