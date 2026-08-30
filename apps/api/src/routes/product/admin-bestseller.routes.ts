import type { Router } from "express";
import { BestSellerTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductAdminBestSellerRoutes = (
  router: Router,
  { productController, rateLimiter, authMiddleware }: ProductRouteDeps,
) => {
  // We use the admin router which is already mounted at /admin
  router.get(
    "/admin/bestsellers",
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    rateLimiter,
    validateMultiple(BestSellerTypes.GetBestSellersAdmin),
    productController.getBestSellersAdmin,
  );

  router.get(
    "/admin/bestsellers/analytics",
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    rateLimiter,
    validateMultiple(BestSellerTypes.GetBestSellerAnalytics),
    productController.getBestSellerAnalytics,
  );
};
