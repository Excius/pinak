import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./route-deps.js";

export const registerProductAdminImageRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.post(
    "/admin/variants/:variantId/images",
    rateLimiter,
    validateMultiple(ProductTypes.AddProductImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.addProductImage,
  );

  router.patch(
    "/admin/images/:imageId/primary",
    rateLimiter,
    validateMultiple(ProductTypes.SetPrimaryImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.setPrimaryImage,
  );

  router.delete(
    "/admin/images/:id",
    rateLimiter,
    validateMultiple(ProductTypes.SoftDeleteProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.softDeleteImage,
  );

  router.patch(
    "/admin/images/:id/restore",
    rateLimiter,
    validateMultiple(ProductTypes.RestoreProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.restoreImage,
  );

  router.delete(
    "/admin/images/:id/hard",
    rateLimiter,
    validateMultiple(ProductTypes.HardDeleteProduct),
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    productController.hardDeleteImage,
  );
};
