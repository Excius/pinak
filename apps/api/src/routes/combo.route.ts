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

// Public (users) - read-only
router.get(
  "/",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(ComboKitTypes.GetComboKits),
  comboController.getComboKits,
);

router.get(
  "/slug/:slug",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(ComboKitTypes.GetComboKitBySlug),
  comboController.getComboKitBySlug,
);

// Manager / Admin - full access
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

router.post(
  "/:comboKitId/items",
  rateLimiter,
  validateMultiple(ComboKitTypes.AddComboKitItem),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  comboController.addComboKitItem,
);

router.delete(
  "/:comboKitId/items/:itemId",
  rateLimiter,
  validateMultiple(ComboKitTypes.RemoveComboKitItem),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  comboController.removeComboKitItem,
);

router.delete(
  "/:id",
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

// Admin-only hard delete
router.delete(
  "/admin/:id/hard",
  rateLimiter,
  validateMultiple(ComboKitTypes.HardDeleteComboKit),
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  comboController.hardDeleteComboKit,
);

export default router;
