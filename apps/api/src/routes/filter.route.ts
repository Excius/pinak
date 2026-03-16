import { Router } from "express";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { FilterRepository } from "../repositories/filter.repository.js";
import { FilterService } from "../services/filter.service.js";
import { FilterController } from "../controllers/filter.controller.js";
import { prisma } from "../lib/prisma.js";
import { FilterTypes } from "@repo/types";

const router = Router();
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const repo = new FilterRepository(prisma);
const service = new FilterService(repo);
const controller = new FilterController(service);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

// Public
router.get(
  "/groups",
  rateLimiter,
  validateMultiple(FilterTypes.ListGroups),
  controller.listGroups,
);
router.get(
  "/groups/:id",
  rateLimiter,
  validateMultiple(FilterTypes.GetGroupById),
  controller.getGroup,
);

// Admin - group management
router.post(
  "/groups",
  rateLimiter,
  validateMultiple(FilterTypes.CreateGroup),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.createGroup,
);
router.put(
  "/groups/:id",
  rateLimiter,
  validateMultiple(FilterTypes.UpdateGroup),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.updateGroup,
);
router.delete(
  "/groups/:id",
  rateLimiter,
  validateMultiple(FilterTypes.DeleteGroup),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.deleteGroup,
);

// Filter values
router.post(
  "/groups/:groupId/values",
  rateLimiter,
  validateMultiple(FilterTypes.CreateValue),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.createValue,
);
router.put(
  "/values/:id",
  rateLimiter,
  validateMultiple(FilterTypes.UpdateValue),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.updateValue,
);
router.delete(
  "/values/:id",
  rateLimiter,
  validateMultiple(FilterTypes.DeleteValue),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.deleteValue,
);

// Attach/remove filter value to product (admin)
router.post(
  "/products/:productId/values/:filterValueId",
  rateLimiter,
  validateMultiple(FilterTypes.AddFilterToProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.addFilterToProduct,
);
router.delete(
  "/products/:productId/values/:filterValueId",
  rateLimiter,
  validateMultiple(FilterTypes.RemoveFilterFromProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.removeFilterFromProduct,
);

export default router;
