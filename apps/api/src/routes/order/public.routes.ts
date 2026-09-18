import type { Router } from "express";
import { OrderTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { OrderRouteDeps } from "./index.js";

export const registerOrderPublicRoutes = (
  router: Router,
  { controller, invoiceController, authMiddleware, rateLimiter }: OrderRouteDeps,
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
    "/:orderId/invoice/pdf",
    authMiddleware.authenticate,
    rateLimiter,
    invoiceController.getInvoicePdf,
  );

  router.get(
    "/:orderId/invoice/data",
    authMiddleware.authenticate,
    rateLimiter,
    invoiceController.getInvoiceData,
  );

  router.get(
    "/:orderId/invoice",
    authMiddleware.authenticate,
    rateLimiter,
    invoiceController.getInvoiceHtml,
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
