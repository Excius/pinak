import type { Router } from "express";
import multer from "multer";
import { ProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductAdminInventoryRoutes = (
  router: Router,
  { productController, authMiddleware, rateLimiter }: ProductRouteDeps,
) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max spreadsheet size
  });

  router.post(
    "/admin/inventory/import",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    upload.single("file"),
    validateMultiple(ProductTypes.ImportInventory),
    productController.importInventory,
  );

  router.get(
    "/admin/inventory/export",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.ExportInventory),
    productController.exportInventory,
  );

  router.patch(
    "/admin/inventory/bulk-status",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ProductTypes.BulkUpdateProductStatus),
    productController.bulkUpdateProductStatus,
  );
};
