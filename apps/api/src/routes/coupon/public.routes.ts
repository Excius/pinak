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
    authMiddleware.authenticate,
    rateLimiter,
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
