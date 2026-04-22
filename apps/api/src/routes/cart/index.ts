import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { CartRepository } from "../../repositories/cart.repository.js";
import { CartController } from "../../controllers/cart.controller.js";
import { CartService } from "../../services/cart.service.js";
import { StockReservationService } from "../../services/stockReservation.service.js";
import { registerCartPublicRoutes } from "./public.routes.js";

export type CartRouteDeps = {
  controller: CartController;
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

const cartRepository = new CartRepository(prisma);
const stockReservationService = new StockReservationService(prisma);
const cartService = new CartService(cartRepository, stockReservationService);
const controller = new CartController(cartService);

const deps: CartRouteDeps = {
  controller,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerCartPublicRoutes(router, deps);

export default router;
