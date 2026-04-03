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
    validateMultiple(ProductTypes.AddProductToFeatured),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.addProductToFeatured,
  );

  router.delete(
    "/admin/featured/:featuredProductId",
    rateLimiter,
    validateMultiple(ProductTypes.RemoveProductFromFeatured),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.removeProductFromFeatured,
  );
};
