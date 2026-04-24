import type { Router } from "express";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductPublicProductRoutes = (
  router: Router,
  { productController, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(ProductTypes.GetProducts),
    productController.getProducts,
  );

  router.get(
    "/slug/:slug",
    rateLimiter,
    validateMultiple(ProductTypes.GetProductBySlug),
    productController.getProductBySlug,
  );

  router.get(
    "/category/:categoryId",
    rateLimiter,
    validateMultiple(ProductTypes.GetProductsWithCategory),
    productController.getProductsWithCategory,
  );

  router.get(
    "/search",
    rateLimiter,
    validateMultiple(ProductTypes.SearchProducts),
    productController.searchProducts,
  );

  router.get(
    "/:id",
    rateLimiter,
    validateMultiple(ProductTypes.GetProductById),
    productController.getProductWithDetails,
  );
};
