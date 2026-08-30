import type { Router } from "express";
import { BestSellerTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductPublicBestSellerRoutes = (
  router: Router,
  { productController, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/bestsellers",
    rateLimiter,
    validateMultiple(BestSellerTypes.GetBestSellers),
    productController.getBestSellers,
  );
};
