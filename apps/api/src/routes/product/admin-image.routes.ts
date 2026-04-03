import type { Router } from "express";
import multer from "multer";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";
export const registerProductAdminImageRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  }); // 10MB

  router.post(
    "/admin/variants/:variantId/images",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    upload.single("image"),
    validateMultiple(ProductTypes.AddProductImage),
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

  router.put(
    "/admin/images/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    upload.single("image"),
    validateMultiple(ProductTypes.UpdateProductImage),
    productController.updateProductImage,
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
