import type { Router } from "express";
import { BrandAdminTypes, BrandTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { BrandRouteDeps } from "./index.js";

export const registerBrandAdminRoutes = (
  router: Router,
  { brandController, authMiddleware, rateLimiter }: BrandRouteDeps,
) => {
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
    validateMultiple(BrandTypes.CreateBrand),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    brandController.create,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    validateMultiple(BrandTypes.UpdateBrand),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
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
