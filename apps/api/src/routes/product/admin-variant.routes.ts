import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductAdminVariantRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.post(
    "/admin/:productId/variants",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.CreateProductVariant),
    productController.createProductVariant,
  );

  router.get(
    "/admin/variants/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.GetVariantAdmin),
    productController.getVariantByIdAdmin,
  );

  router.put(
    "/admin/variants/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.UpdateProductVariant),
    productController.updateProductVariant,
  );

  router.delete(
    "/admin/variants/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.SoftDeleteProductVariant),
    productController.softDeleteProductVariant,
  );

  router.patch(
    "/admin/variants/:id/restore",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.RestoreProductVariant),
    productController.restoreProductVariant,
  );

  router.patch(
    "/admin/variants/:variantId/stock",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.UpdateVariantStock),
    productController.updateVariantStock,
  );

  router.patch(
    "/admin/variants/stock/bulk",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.BulkUpdateVariantStock),
    productController.bulkUpdateVariantStock,
  );

  router.delete(
    "/admin/variants/:id/hard",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    validateMultiple(ProductTypes.HardDeleteProductVariant),
    productController.hardDeleteProductVariant,
  );
};
