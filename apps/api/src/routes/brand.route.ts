import { Router } from "express";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { BrandRepository } from "../repositories/brand.repository.js";
import { BrandService } from "../services/brand.service.js";
import { BrandController } from "../controllers/brand.controller.js";
import { prisma } from "../lib/prisma.js";
import { BrandTypes } from "@repo/types";

const router = Router();
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const repo = new BrandRepository(prisma);
const service = new BrandService(repo);
const controller = new BrandController(service);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

router.get(
  "/",
  rateLimiter,
  validateMultiple(BrandTypes.ListBrands),
  controller.list,
);
router.get(
  "/:id",
  rateLimiter,
  validateMultiple(BrandTypes.GetBrandById),
  controller.getById,
);
router.get(
  "/slug/:slug",
  rateLimiter,
  validateMultiple(BrandTypes.GetBrandBySlug),
  controller.getBySlug,
);

// Admin
router.post(
  "/",
  rateLimiter,
  validateMultiple(BrandTypes.CreateBrand),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.create,
);
router.put(
  "/:id",
  rateLimiter,
  validateMultiple(BrandTypes.UpdateBrand),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.update,
);
router.delete(
  "/:id",
  rateLimiter,
  validateMultiple(BrandTypes.DeleteBrand),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  controller.delete,
);

export default router;
