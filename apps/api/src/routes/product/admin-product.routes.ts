import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./route-deps.js";

export const registerProductAdminProductRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/admin/all",
    rateLimiter,
    validateMultiple(ProductTypes.GetAllProductsAdmin),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.getAllProductsAdmin,
  );

  router.get(
    "/admin/deleted",
    rateLimiter,
    validateMultiple(ProductTypes.GetAllProductsAdmin),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.getDeletedProductsAdmin,
  );

  router.get(
    "/admin/status/:status",
    rateLimiter,
    validateMultiple(ProductTypes.GetAllProductsAdmin),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.getProductsByStatusAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    validateMultiple(ProductTypes.GetProductById),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.getProductByIdAdmin,
  );

  router.post(
    "/",
    rateLimiter,
    validateMultiple(ProductTypes.CreateProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.createProduct,
  );

  router.put(
    "/:id",
    rateLimiter,
    validateMultiple(ProductTypes.UpdateProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.updateProduct,
  );

  router.patch(
    "/:id/status",
    rateLimiter,
    validateMultiple(ProductTypes.UpdateProductStatus),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.updateProductStatus,
  );

  router.delete(
    "/:id",
    rateLimiter,
    validateMultiple(ProductTypes.SoftDeleteProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.softDeleteProduct,
  );

  router.patch(
    "/:id/restore",
    rateLimiter,
    validateMultiple(ProductTypes.RestoreProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.restoreProduct,
  );

  router.delete(
    "/admin/:id/hard",
    rateLimiter,
    validateMultiple(ProductTypes.HardDeleteProduct),
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    productController.hardDeleteProduct,
  );
};
