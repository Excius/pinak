import type { Router } from "express";
import { OrderAdminTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { OrderRouteDeps } from "./index.js";

export const registerOrderAdminRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: OrderRouteDeps,
) => {
  router.get(
    "/admin",
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    rateLimiter,
    validateMultiple(OrderAdminTypes.ListOrders),
    controller.listOrdersAdmin,
  );

  router.put(
    "/admin/:id/status",
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    rateLimiter,
    validateMultiple(OrderAdminTypes.UpdateOrderStatus),
    controller.updateOrderStatusAdmin,
  );

  router.put(
    "/admin/:id/payment",
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    rateLimiter,
    validateMultiple(OrderAdminTypes.UpdatePaymentStatus),
    controller.updatePaymentStatusAdmin,
  );

  router.delete(
    "/admin/:id/hard",
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    rateLimiter,
    validateMultiple(OrderAdminTypes.HardDeleteOrder),
    controller.hardDeleteOrderAdmin,
  );
};
