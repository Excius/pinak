import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./route-deps.js";

export const registerProductAdminVariantRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.post(
    "/admin/:productId/variants",
    rateLimiter,
    validateMultiple(ProductTypes.CreateProductVariant),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.createProductVariant,
  );

  router.put(
    "/admin/variants/:id",
    rateLimiter,
    validateMultiple(ProductTypes.UpdateProductVariant),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.updateProductVariant,
  );

  router.delete(
    "/admin/variants/:id",
    rateLimiter,
    validateMultiple(ProductTypes.SoftDeleteProductVariant),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.softDeleteProductVariant,
  );

  router.patch(
    "/admin/variants/:id/restore",
    rateLimiter,
    validateMultiple(ProductTypes.RestoreProductVariant),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.restoreProductVariant,
  );

  router.patch(
    "/admin/variants/:variantId/stock",
    rateLimiter,
    validateMultiple(ProductTypes.UpdateVariantStock),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.updateVariantStock,
  );

  router.patch(
    "/admin/variants/stock/bulk",
    rateLimiter,
    validateMultiple(ProductTypes.BulkUpdateVariantStock),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.bulkUpdateVariantStock,
  );

  router.delete(
    "/admin/variants/:id/hard",
    rateLimiter,
    validateMultiple(ProductTypes.HardDeleteProductVariant),
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    productController.hardDeleteProductVariant,
  );
};
