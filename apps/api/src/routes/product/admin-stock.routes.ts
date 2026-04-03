import type { Router } from "express";
import type { ProductRouteDeps } from "./index.js";

export const registerProductAdminStockRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  router.get(
    "/admin/stock/out-of-stock",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.getOutOfStockProducts,
  );

  router.get(
    "/admin/stock/low-stock",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    productController.getLowStockProducts,
  );
};
