import type { Router } from "express";
import multer from "multer";
import { ComboKitTypes, ComboKitAdminTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ComboRouteDeps } from "./index.js";

export const registerComboAdminRoutes = (
  router: Router,
  { comboController, authMiddleware, rateLimiter }: ComboRouteDeps,
) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  }); // 10MB
  // Admin read endpoints (full payloads)
  router.get(
    "/admin/all",
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitsAdmin),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.getAllComboKitsAdmin,
  );

  router.get(
    "/admin/deleted",
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitsAdmin),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.getDeletedComboKitsAdmin,
  );

  router.get(
    "/admin/inactive",
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitsAdmin),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.getInactiveComboKitsAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitAdminById),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.getComboKitByIdAdmin,
  );

  router.get(
    "/admin/:id/dependencies",
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitDependencies),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.getComboKitDependencies,
  );

  router.get(
    "/admin/:id/analytics",
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitAnalytics),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.getComboKitAnalytics,
  );

  // Admin write endpoints
  router.post(
    "/admin",
    rateLimiter,
    validateMultiple(ComboKitTypes.CreateComboKit),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.createComboKit,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    validateMultiple(ComboKitTypes.UpdateComboKit),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.updateComboKit,
  );

  router.patch(
    "/admin/:id/status",
    rateLimiter,
    validateMultiple(ComboKitTypes.UpdateComboKitStatus),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.updateComboKitStatus,
  );

  router.patch(
    "/admin/:id/pricing",
    rateLimiter,
    validateMultiple(ComboKitTypes.UpdateComboKitPricing),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.updateComboKitPricing,
  );

  router.patch(
    "/admin/:id/metadata",
    rateLimiter,
    validateMultiple(ComboKitTypes.UpdateComboKitMetadata),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.updateComboKitMetadata,
  );

  router.post(
    "/admin/:comboKitId/items",
    rateLimiter,
    validateMultiple(ComboKitTypes.AddComboKitItem),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.addComboKitItem,
  );

  router.put(
    "/admin/:comboKitId/items/:itemId",
    rateLimiter,
    validateMultiple(ComboKitTypes.UpdateComboKitItem),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.updateComboKitItem,
  );

  router.delete(
    "/admin/:comboKitId/items/:itemId",
    rateLimiter,
    validateMultiple(ComboKitTypes.RemoveComboKitItem),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.removeComboKitItem,
  );

  router.post(
    "/admin/:comboKitId/items/reorder",
    rateLimiter,
    validateMultiple(ComboKitTypes.ReorderComboKitItems),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.reorderComboKitItems,
  );

  router.post(
    "/admin/:comboKitId/items/bulk-set",
    rateLimiter,
    validateMultiple(ComboKitTypes.BulkSetComboKitItems),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.bulkSetComboKitItems,
  );

  router.patch(
    "/admin/:id/soft-delete",
    rateLimiter,
    validateMultiple(ComboKitTypes.SoftDeleteComboKit),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.softDeleteComboKit,
  );

  router.patch(
    "/admin/:id/restore",
    rateLimiter,
    validateMultiple(ComboKitTypes.RestoreComboKit),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.restoreComboKit,
  );

  router.delete(
    "/admin/:id/hard",
    rateLimiter,
    validateMultiple(ComboKitTypes.HardDeleteComboKit),
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    comboController.hardDeleteComboKit,
  );

  // Admin image routes for ComboKit
  router.get(
    "/admin/:comboKitId/images",
    rateLimiter,
    validateMultiple(ComboKitAdminTypes.AdminGetComboKitImages),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.getAllImages,
  );

  router.post(
    "/admin/:comboKitId/images",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    upload.single("image"),
    validateMultiple(ComboKitAdminTypes.AddComboKitImage),
    comboController.addComboKitImage,
  );

  router.patch(
    "/admin/images/:imageId/primary",
    rateLimiter,
    validateMultiple(ComboKitAdminTypes.SetPrimaryComboKitImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.setPrimaryImage,
  );

  router.delete(
    "/admin/images/:id",
    rateLimiter,
    validateMultiple(ComboKitAdminTypes.DeleteComboKitImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.deleteImage,
  );
};
