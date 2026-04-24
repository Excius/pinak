import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductPublicVariantRoutes = (
  router: Router,
  { productController, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/variant/:variantId",
    rateLimiter,
    validateMultiple(ProductTypes.GetVariant),
    productController.getVariantById,
  );

  router.get(
    "/:productId/variants",
    rateLimiter,
    validateMultiple(ProductTypes.GetProductVariants),
    productController.getProductVariants,
  );
};
