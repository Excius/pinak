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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(BrandAdminTypes.ListBrands),
    brandController.listAdmin,
  );

  router.get(
    "/admin/slug/:slug",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(BrandAdminTypes.GetBrandBySlug),
    brandController.getBySlugAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(BrandAdminTypes.GetBrandById),
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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(BrandTypes.DeleteBrand),
    brandController.delete,
  );
};
