import type { Router } from "express";
import { BrandTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { BrandRouteDeps } from "./index.js";

export const registerBrandPublicRoutes = (
  router: Router,
  { brandController, rateLimiter }: BrandRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(BrandTypes.ListBrands),
    brandController.listPublic,
  );

  router.get(
    "/slug/:slug",
    rateLimiter,
    validateMultiple(BrandTypes.GetBrandBySlug),
    brandController.getBySlugPublic,
  );

  router.get(
    "/:id",
    rateLimiter,
    validateMultiple(BrandTypes.GetBrandById),
    brandController.getByIdPublic,
  );
};
