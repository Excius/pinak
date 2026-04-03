import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductPublicVariantRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/variant/:variantId",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.GetVariant),
    productController.getVariantById,
  );

  router.get(
    "/:productId/variants",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.GetProductVariants),
    productController.getProductVariants,
  );
};
