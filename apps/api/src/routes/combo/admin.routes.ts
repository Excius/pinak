import type { Router } from "express";
import { ComboKitTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ComboRouteDeps } from "./index.js";

export const registerComboAdminRoutes = (
  router: Router,
  { comboController, authMiddleware, rateLimiter }: ComboRouteDeps,
) => {
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
    "/",
    rateLimiter,
    validateMultiple(ComboKitTypes.CreateComboKit),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.createComboKit,
  );

  router.put(
    "/:id",
    rateLimiter,
    validateMultiple(ComboKitTypes.UpdateComboKit),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.updateComboKit,
  );

  router.patch(
    "/:id/status",
    rateLimiter,
    validateMultiple(ComboKitTypes.UpdateComboKitStatus),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.updateComboKitStatus,
  );

  router.patch(
    "/:id/pricing",
    rateLimiter,
    validateMultiple(ComboKitTypes.UpdateComboKitPricing),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.updateComboKitPricing,
  );

  router.patch(
    "/:id/metadata",
    rateLimiter,
    validateMultiple(ComboKitTypes.UpdateComboKitMetadata),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.updateComboKitMetadata,
  );

  router.post(
    "/:comboKitId/items",
    rateLimiter,
    validateMultiple(ComboKitTypes.AddComboKitItem),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.addComboKitItem,
  );

  router.put(
    "/:comboKitId/items/:itemId",
    rateLimiter,
    validateMultiple(ComboKitTypes.UpdateComboKitItem),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.updateComboKitItem,
  );

  router.delete(
    "/:comboKitId/items/:itemId",
    rateLimiter,
    validateMultiple(ComboKitTypes.RemoveComboKitItem),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.removeComboKitItem,
  );

  router.post(
    "/:comboKitId/items/reorder",
    rateLimiter,
    validateMultiple(ComboKitTypes.ReorderComboKitItems),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.reorderComboKitItems,
  );

  router.post(
    "/:comboKitId/items/bulk-set",
    rateLimiter,
    validateMultiple(ComboKitTypes.BulkSetComboKitItems),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.bulkSetComboKitItems,
  );

  router.patch(
    "/:id/soft-delete",
    rateLimiter,
    validateMultiple(ComboKitTypes.SoftDeleteComboKit),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    comboController.softDeleteComboKit,
  );

  router.patch(
    "/:id/restore",
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
};
