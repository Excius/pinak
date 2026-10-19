import type { Router } from "express";
import multer from "multer";
import { BrandAdminTypes, BrandTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { BrandRouteDeps } from "./index.js";

export const registerBrandAdminRoutes = (
  router: Router,
  { brandController, authMiddleware, rateLimiter }: BrandRouteDeps,
) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  }); // 10MB

  router.get(
    "/admin",
    rateLimiter,
    validateMultiple(BrandAdminTypes.ListBrands),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    brandController.listAdmin,
  );

  router.get(
    "/admin/slug/:slug",
    rateLimiter,
    validateMultiple(BrandAdminTypes.GetBrandBySlug),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    brandController.getBySlugAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    validateMultiple(BrandAdminTypes.GetBrandById),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    brandController.getByIdAdmin,
  );

  router.post(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    upload.single("logo"),
    validateMultiple(BrandTypes.CreateBrand),
    brandController.create,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    upload.single("logo"),
    validateMultiple(BrandTypes.UpdateBrand),
    brandController.update,
  );

  router.delete(
    "/admin/:id",
    rateLimiter,
    validateMultiple(BrandTypes.DeleteBrand),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    brandController.delete,
  );
};
