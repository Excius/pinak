import type { Router } from "express";
import { BrandTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { BrandRouteDeps } from "./index.js";

export const registerBrandPublicRoutes = (
  router: Router,
  { brandController, authMiddleware, rateLimiter }: BrandRouteDeps,
) => {
  router.get(
    "/",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(BrandTypes.ListBrands),
    brandController.listPublic,
  );

  router.get(
    "/slug/:slug",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(BrandTypes.GetBrandBySlug),
    brandController.getBySlugPublic,
  );

  router.get(
    "/:id",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(BrandTypes.GetBrandById),
    brandController.getByIdPublic,
  );
};
