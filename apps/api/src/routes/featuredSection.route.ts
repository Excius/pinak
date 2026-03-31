import { Router } from "express";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { FeaturedSectionRepository } from "../repositories/featuredSection.repository.js";
import { FeaturedSectionService } from "../services/featuredSection.service.js";
import { FeaturedSectionController } from "../controllers/featuredSection.controller.js";
import { prisma } from "../lib/prisma.js";
import { FeaturedSectionTypes } from "@repo/types";

const router = Router();
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const repo = new FeaturedSectionRepository(prisma);
const service = new FeaturedSectionService(repo);
const controller = new FeaturedSectionController(service);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

// Public routes
router.get(
  "/",
  rateLimiter,
  validateMultiple(FeaturedSectionTypes.ListFeaturedSections),
  controller.list,
);

router.get(
  "/:id",
  rateLimiter,
  validateMultiple(FeaturedSectionTypes.GetFeaturedSectionById),
  controller.getById,
);

// Admin routes
router.post(
  "/",
  rateLimiter,
  validateMultiple(FeaturedSectionTypes.CreateFeaturedSection),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.create,
);

router.put(
  "/:id",
  rateLimiter,
  validateMultiple(FeaturedSectionTypes.UpdateFeaturedSection),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.update,
);

router.delete(
  "/:id",
  rateLimiter,
  validateMultiple(FeaturedSectionTypes.DeleteFeaturedSection),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.delete,
);

export default router;
