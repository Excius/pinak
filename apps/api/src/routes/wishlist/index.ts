import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { WishlistRepository } from "../../repositories/wishlist.repository.js";
import { WishlistService } from "../../services/wishlist.service.js";
import { WishlistController } from "../../controllers/wishlist.controller.js";
import { registerWishlistPublicRoutes } from "./public.routes.js";

export type WishlistRouteDeps = {
  controller: WishlistController;
  authMiddleware: AuthMiddleware;
  rateLimiter: ReturnType<typeof createRateLimiter>;
};

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

const deps: WishlistRouteDeps = {
  controller,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerWishlistPublicRoutes(router, deps);

export default router;
