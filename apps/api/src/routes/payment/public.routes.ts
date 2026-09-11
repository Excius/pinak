import type { Router } from "express";
import type { PaymentRouteDeps } from "./index.js";
import { OrderTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";

export const registerPaymentPublicRoutes = (
  router: Router,
  { controller, rateLimiter }: PaymentRouteDeps,
) => {
  // Webhooks from Razorpay
  router.post(
    "/webhook/razorpay",
    rateLimiter,
    // Note: We don't use strict Zod validation here because the payload shape is defined by Razorpay
    // and we must verify the cryptographic signature instead.
    controller.handleRazorpayWebhook,
  );

  // Synchronous verification from the frontend
  router.post(
    "/verify",
    rateLimiter,
    validateMultiple(OrderTypes.VerifyPayment),
    controller.verifyFrontendPayment,
  );
};
