import type { Router } from "express";
import { OrderTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { PaymentRouteDeps } from "./index.js";

export const registerPaymentPublicRoutes = (
  router: Router,
  { controller, rateLimiter }: PaymentRouteDeps,
) => {
  router.post(
    "/payment",
    rateLimiter,
    validateMultiple(OrderTypes.PaymentWebhook),
    controller.handlePaymentWebhook,
  );
};
