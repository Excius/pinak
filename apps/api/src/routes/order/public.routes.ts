import type { Router } from "express";
import { OrderTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { OrderRouteDeps } from "./index.js";

export const registerOrderPublicRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: OrderRouteDeps,
) => {
  router.post(
    "/",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(OrderTypes.CreateOrder),
    controller.createOrder,
  );

  router.get(
    "/",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(OrderTypes.GetOrders),
    controller.getOrders,
  );

  router.get(
    "/:orderId",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(OrderTypes.GetOrderById),
    controller.getOrderById,
  );

  router.put(
    "/:orderId/cancel",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(OrderTypes.CancelOrder),
    controller.cancelOrder,
  );
};
