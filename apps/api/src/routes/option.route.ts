import { Router } from "express";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { OptionRepository } from "../repositories/option.repository.js";
import { OptionService } from "../services/option.service.js";
import { OptionController } from "../controllers/option.controller.js";
import { prisma } from "../lib/prisma.js";
import { OptionTypes } from "@repo/types";

const router = Router();
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const repo = new OptionRepository(prisma);
const service = new OptionService(repo);
const controller = new OptionController(service);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

router.get(
  "/",
  rateLimiter,
  validateMultiple(OptionTypes.ListOptions),
  controller.list,
);
router.get(
  "/:id",
  rateLimiter,
  validateMultiple(OptionTypes.GetOptionById),
  controller.getById,
);

// Admin
router.post(
  "/",
  rateLimiter,
  validateMultiple(OptionTypes.CreateOption),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.create,
);
router.put(
  "/:id",
  rateLimiter,
  validateMultiple(OptionTypes.UpdateOption),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.update,
);
router.delete(
  "/:id",
  rateLimiter,
  validateMultiple(OptionTypes.DeleteOption),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.remove,
);

// Option values
router.post(
  "/:optionId/values",
  rateLimiter,
  validateMultiple(OptionTypes.CreateOptionValue),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.createValue,
);
router.put(
  "/values/:id",
  rateLimiter,
  validateMultiple(OptionTypes.UpdateOptionValue),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.updateValue,
);
router.delete(
  "/values/:id",
  rateLimiter,
  validateMultiple(OptionTypes.DeleteOptionValue),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.deleteValue,
);

export default router;
