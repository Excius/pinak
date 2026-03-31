import { Router } from "express";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { TaxClassRepository } from "../repositories/taxClass.repository.js";
import { TaxClassService } from "../services/taxClass.service.js";
import { TaxClassController } from "../controllers/taxClass.controller.js";
import { prisma } from "../lib/prisma.js";
import { TaxClassTypes } from "@repo/types";

const router = Router();
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const repo = new TaxClassRepository(prisma);
const service = new TaxClassService(repo);
const controller = new TaxClassController(service);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

router.get(
  "/",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(TaxClassTypes.List),
  controller.list,
);
router.get(
  "/:id",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(TaxClassTypes.GetById),
  controller.get,
);

// Admin
router.post(
  "/",
  rateLimiter,
  validateMultiple(TaxClassTypes.Create),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.create,
);
router.put(
  "/:id",
  rateLimiter,
  validateMultiple(TaxClassTypes.Update),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.update,
);
router.delete(
  "/:id",
  rateLimiter,
  validateMultiple(TaxClassTypes.Delete),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.delete,
);

export default router;
