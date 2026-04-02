import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./route-deps.js";

export const registerProductPublicVariantRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/:productId/variants",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.GetProductVariants),
    productController.getProductVariants,
  );
};
