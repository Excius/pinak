import type { Router } from "express";
import { CouponTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { CouponRouteDeps } from "./index.js";

export const registerCouponAdminRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: CouponRouteDeps,
) => {
  // Guards are applied per route (not with router.use) so they never leak
  // onto the public routes registered on the same router.
  const guard = [
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
  ];

  router.get(
    "/admin",
    ...guard,
    validateMultiple(CouponTypes.AdminListCoupons),
    controller.listCouponsAdmin,
  );

  router.post(
    "/admin",
    ...guard,
    validateMultiple(CouponTypes.AdminCreateCoupon),
    controller.createCouponAdmin,
  );

  router.post(
    "/admin/validate",
    ...guard,
    validateMultiple(CouponTypes.AdminValidateCoupon),
    controller.validateCouponAdmin,
  );

  router.get(
    "/admin/:code",
    ...guard,
    validateMultiple(CouponTypes.AdminGetCoupon),
    controller.getCouponAdmin,
  );

  router.put(
    "/admin/:id",
    ...guard,
    validateMultiple(CouponTypes.AdminUpdateCoupon),
    controller.updateCouponAdmin,
  );

  router.put(
    "/admin/:id/status",
    ...guard,
    validateMultiple(CouponTypes.AdminUpdateCouponStatus),
    controller.updateCouponStatusAdmin,
  );

  router.delete(
    "/admin/:id/soft",
    ...guard,
    validateMultiple(CouponTypes.AdminSoftDeleteCoupon),
    controller.softDeleteCouponAdmin,
  );

  router.put(
    "/admin/:id/restore",
    ...guard,
    validateMultiple(CouponTypes.AdminRestoreCoupon),
    controller.restoreCouponAdmin,
  );

  router.delete(
    "/admin/:id/hard",
    ...guard,
    authMiddleware.requireAdmin,
    validateMultiple(CouponTypes.AdminHardDeleteCoupon),
    controller.hardDeleteCouponAdmin,
  );
};
