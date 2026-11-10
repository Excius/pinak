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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.GetComboKitsAdmin),
    comboController.getAllComboKitsAdmin,
  );

  router.get(
    "/admin/deleted",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.GetComboKitsAdmin),
    comboController.getDeletedComboKitsAdmin,
  );

  router.get(
    "/admin/inactive",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.GetComboKitsAdmin),
    comboController.getInactiveComboKitsAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.GetComboKitAdminById),
    comboController.getComboKitByIdAdmin,
  );

  router.get(
    "/admin/:id/dependencies",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.GetComboKitDependencies),
    comboController.getComboKitDependencies,
  );

  router.get(
    "/admin/:id/analytics",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.GetComboKitAnalytics),
    comboController.getComboKitAnalytics,
  );

  // Admin write endpoints
  router.post(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.CreateComboKit),
    comboController.createComboKit,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.UpdateComboKit),
    comboController.updateComboKit,
  );

  router.patch(
    "/admin/:id/status",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.UpdateComboKitStatus),
    comboController.updateComboKitStatus,
  );

  router.patch(
    "/admin/:id/pricing",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.UpdateComboKitPricing),
    comboController.updateComboKitPricing,
  );

  router.patch(
    "/admin/:id/metadata",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.UpdateComboKitMetadata),
    comboController.updateComboKitMetadata,
  );

  router.post(
    "/admin/:comboKitId/items",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.AddComboKitItem),
    comboController.addComboKitItem,
  );

  router.put(
    "/admin/:comboKitId/items/:itemId",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.UpdateComboKitItem),
    comboController.updateComboKitItem,
  );

  router.delete(
    "/admin/:comboKitId/items/:itemId",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.RemoveComboKitItem),
    comboController.removeComboKitItem,
  );

  router.post(
    "/admin/:comboKitId/items/reorder",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.ReorderComboKitItems),
    comboController.reorderComboKitItems,
  );

  router.post(
    "/admin/:comboKitId/items/bulk-set",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.BulkSetComboKitItems),
    comboController.bulkSetComboKitItems,
  );

  router.patch(
    "/admin/:id/soft-delete",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.SoftDeleteComboKit),
    comboController.softDeleteComboKit,
  );

  router.patch(
    "/admin/:id/restore",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitTypes.RestoreComboKit),
    comboController.restoreComboKit,
  );

  router.delete(
    "/admin/:id/hard",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    validateMultiple(ComboKitTypes.HardDeleteComboKit),
    comboController.hardDeleteComboKit,
  );

  // Admin image routes for ComboKit
  router.get(
    "/admin/:comboKitId/images",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitAdminTypes.AdminGetComboKitImages),
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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitAdminTypes.SetPrimaryComboKitImage),
    comboController.setPrimaryImage,
  );

  router.delete(
    "/admin/images/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(ComboKitAdminTypes.DeleteComboKitImage),
    comboController.deleteImage,
  );
};
