import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductAdminFeaturedRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.post(
    "/admin/featured/:sectionId",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.AddProductToFeatured),
    productController.addProductToFeatured,
  );

  router.delete(
    "/admin/featured/:featuredProductId",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.RemoveProductFromFeatured),
    productController.removeProductFromFeatured,
  );
};
