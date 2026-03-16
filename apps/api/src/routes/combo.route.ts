import { Router } from "express";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { ComboRepository } from "../repositories/combo.repository.js";
import { ComboService } from "../services/combo.service.js";
import { ComboController } from "../controllers/combo.controller.js";
import { prisma } from "../lib/prisma.js";
import { ComboKitTypes } from "@repo/types";

const router = Router();
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const comboRepository = new ComboRepository(prisma);
const comboService = new ComboService(comboRepository);
const comboController = new ComboController(comboService);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

// Public routes
router.get(
  "/",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(ComboKitTypes.GetComboKits),
  comboController.getComboKits,
);

router.get(
  "/search",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(ComboKitTypes.SearchComboKits),
  comboController.searchComboKits,
);

router.get(
  "/slug/:slug",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(ComboKitTypes.GetComboKitBySlug),
  comboController.getComboKitBySlug,
);

router.get(
  "/:id/items",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(ComboKitTypes.GetComboKitItems),
  comboController.getComboKitItems,
);

router.get(
  "/:id",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(ComboKitTypes.GetComboKitById),
  comboController.getComboKitById,
);

router.patch(
  "/:id/increment-view",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(ComboKitTypes.IncrementComboKitView),
  comboController.incrementComboKitView,
);

router.patch(
  "/:id/increment-purchase",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(ComboKitTypes.IncrementComboKitPurchase),
  comboController.incrementComboKitPurchase,
);

// Admin / moderator routes
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

export default router;
