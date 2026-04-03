import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductPublicFeaturedRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/featured",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.GetFeaturedProducts),
    productController.getFeaturedProducts,
  );

  router.get(
    "/featured/section/:sectionId",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.GetFeaturedProductsBySection),
    productController.getFeaturedProductsBySection,
  );
};
