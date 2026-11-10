import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductAdminProductRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/admin/all",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.GetAllProductsAdmin),
    productController.getAllProductsAdmin,
  );

  router.get(
    "/admin/deleted",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.GetAllProductsAdmin),
    productController.getDeletedProductsAdmin,
  );

  router.get(
    "/admin/status/:status",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.GetProductsByStatusAdmin),
    productController.getProductsByStatusAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.GetProductById),
    productController.getProductByIdAdmin,
  );

  router.post(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.CreateProduct),
    productController.createProduct,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.UpdateProduct),
    productController.updateProduct,
  );

  router.patch(
    "/admin/:id/status",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.UpdateProductStatus),
    productController.updateProductStatus,
  );

  router.delete(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.SoftDeleteProduct),
    productController.softDeleteProduct,
  );

  router.patch(
    "/admin/:id/restore",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.RestoreProduct),
    productController.restoreProduct,
  );

  router.delete(
    "/admin/:id/hard",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    validateMultiple(ProductTypes.HardDeleteProduct),
    productController.hardDeleteProduct,
  );
};
