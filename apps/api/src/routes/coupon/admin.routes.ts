import type { Router } from "express";
import { CouponTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { CouponRouteDeps } from "./index.js";

export const registerCouponAdminRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: CouponRouteDeps,
) => {
  router.use(authMiddleware.authenticate);
  router.use(authMiddleware.requireModeratorOrAdmin);

  router.post(
    "/admin/validate",
    rateLimiter,
    validateMultiple(CouponTypes.AdminValidateCoupon),
    controller.validateCouponAdmin,
  );

  router.get(
    "/admin/:code",
    rateLimiter,
    validateMultiple(CouponTypes.AdminGetCoupon),
    controller.getCouponAdmin,
  );
};
