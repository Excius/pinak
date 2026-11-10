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

  router.get(
    "/admin/variants/:variantId/images",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.AdminGetProductVariantImages),
    productController.getAllImages,
  );

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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.SetPrimaryImage),
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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.DeleteImage),
    productController.deleteImage,
  );
};
