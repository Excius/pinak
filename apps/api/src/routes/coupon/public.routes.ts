import type { Router } from "express";
import { CouponTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { CouponRouteDeps } from "./index.js";

export const registerCouponPublicRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: CouponRouteDeps,
) => {
  router.post(
    "/validate",
    rateLimiter,
    authMiddleware.authenticate,
    validateMultiple(CouponTypes.ValidateCoupon),
    controller.validateCoupon,
  );

  router.get(
    "/:code",
    rateLimiter,
    validateMultiple(CouponTypes.GetCoupon),
    controller.getCoupon,
  );
};
