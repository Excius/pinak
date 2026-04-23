import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { CouponRepository } from "../../repositories/coupon.repository.js";
import { CouponService } from "../../services/coupon.service.js";
import { CouponController } from "../../controllers/coupon.controller.js";
import { registerCouponPublicRoutes } from "./public.routes.js";
import { registerCouponAdminRoutes } from "./admin.routes.js";

export type CouponRouteDeps = {
  controller: CouponController;
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

const couponRepository = new CouponRepository(prisma);
const couponService = new CouponService(couponRepository);
const controller = new CouponController(couponService);

const deps: CouponRouteDeps = {
  controller,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerCouponPublicRoutes(router, deps);
registerCouponAdminRoutes(router, deps);

export default router;
