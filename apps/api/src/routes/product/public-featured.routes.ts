import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductPublicFeaturedRoutes = (
  router: Router,
  { productController, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/featured",
    rateLimiter,
    validateMultiple(ProductTypes.GetFeaturedProducts),
    productController.getFeaturedProducts,
  );

  router.get(
    "/featured/section/:sectionId",
    rateLimiter,
    validateMultiple(ProductTypes.GetFeaturedProductsBySection),
    productController.getFeaturedProductsBySection,
  );
};
