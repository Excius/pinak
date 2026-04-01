import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./route-deps.js";

export const registerProductPublicProductRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.GetProducts),
    productController.getProducts,
  );

  router.get(
    "/slug/:slug",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.GetProductBySlug),
    productController.getProductBySlug,
  );

  router.get(
    "/category/:categoryId",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.GetProductsWithCategory),
    productController.getProductsWithCategory,
  );

  router.get(
    "/search",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.SearchProducts),
    productController.searchProducts,
  );

  router.get(
    "/:id/details",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.GetProductDetails),
    productController.getProductWithDetails,
  );

  router.get(
    "/:id",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ProductTypes.GetProductById),
    productController.getProductById,
  );
};
