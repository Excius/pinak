import { Router } from "express";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { RelatedProductRepository } from "../repositories/relatedProduct.repository.js";
import { RelatedProductService } from "../services/relatedProduct.service.js";
import { RelatedProductController } from "../controllers/relatedProduct.controller.js";
import { prisma } from "../lib/prisma.js";
import { RelatedProductTypes } from "@repo/types";

const router = Router();
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const repo = new RelatedProductRepository(prisma);
const service = new RelatedProductService(repo);
const controller = new RelatedProductController(service);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

router.get(
  "/:productId/related",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(RelatedProductTypes.ListRelated),
  controller.list,
);

// Admin
router.post(
  "/:productId/related",
  rateLimiter,
  validateMultiple(RelatedProductTypes.AddRelatedProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.add,
);
router.delete(
  "/:productId/related/:relatedProductId",
  rateLimiter,
  validateMultiple(RelatedProductTypes.RemoveRelatedProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.remove,
);

export default router;
