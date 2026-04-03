import { Router } from "express";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { WishlistRepository } from "../repositories/wishlist.repository.js";
import { WishlistService } from "../services/wishlist.service.js";
import { WishlistController } from "../controllers/wishlist.controller.js";
import { prisma } from "../lib/prisma.js";
import { WishlistTypes } from "@repo/types";

const router = Router();
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const repo = new WishlistRepository(prisma);
const service = new WishlistService(repo);
const controller = new WishlistController(service);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

// All wishlist routes require authentication
router.use(authMiddleware.authenticate);

// Get user's wishlist
router.get(
  "/",
  rateLimiter,
  validateMultiple(WishlistTypes.GetWishlist),
  controller.getWishlist,
);

// Add item to wishlist
router.post(
  "/items",
  rateLimiter,
  validateMultiple(WishlistTypes.AddToWishlist),
  controller.addToWishlist,
);

// Remove item from wishlist
router.delete(
  "/items/:itemId",
  rateLimiter,
  validateMultiple(WishlistTypes.RemoveFromWishlist),
  controller.removeFromWishlist,
);

// Clear entire wishlist
router.delete(
  "/",
  rateLimiter,
  validateMultiple(WishlistTypes.ClearWishlist),
  controller.clearWishlist,
);

export default router;
