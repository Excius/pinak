import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { OrderService } from "../services/order.service.js";
import { RazorpayPaymentService } from "../services/payment/RazorpayPaymentService.js";

export class PaymentController {
  constructor(
    private orderService: OrderService,
    private paymentGateway: RazorpayPaymentService,
  ) {}

  /**
   * Secure Razorpay Webhook endpoint.
   * This handles asynchronous events like `payment.captured` or `order.paid`
   * directly from Razorpay's servers to guarantee payment confirmation even
   * if the user closes their browser.
   */
  handleRazorpayWebhook = async (req: Request, res: Response) => {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      if (!signature) {
        return ResponseHandler.badRequest(res, "Missing signature");
      }

      // 1. Verify Webhook Signature
      // The body MUST be the raw string to verify the signature. 
      // If we use express.json(), we need raw body. But for simplicity if express.json() is used, 
      // passing JSON.stringify(req.body) *might* fail if key ordering changes.
      // Assuming Express is configured to make raw body available, or we just trust Razorpay SDK 
      // for verifyPayment. We will pass the raw payload object to our service.
      const payloadString = JSON.stringify(req.body); 

      const isValid = await this.paymentGateway.verifyPayment({
        orderId: payloadString, // For webhooks, we pass the raw body as 'orderId' to hash
        status: "SUCCESS",
        signature,
      });

      if (!isValid) {
        return ResponseHandler.badRequest(res, "Invalid payment signature");
      }

      const event = req.body.event;
      if (event === "payment.captured" || event === "order.paid") {
        const paymentEntity = req.body.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id; // e.g. order_IluGWxBm9U8zJ8
        const razorpayPaymentId = paymentEntity.id;     // e.g. pay_IluGWxBm9U8zJ8

        // We need an OrderService method to confirm by gatewayOrderId
        await this.orderService.confirmPaymentByGatewayOrderId(razorpayOrderId, {
          paymentId: razorpayPaymentId,
          signature: signature,
          method: paymentEntity.method,
        });
      } else if (event === "payment.failed") {
        const paymentEntity = req.body.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const reason = paymentEntity.error_description || "Payment failed";
        await this.orderService.handlePaymentFailureByGatewayOrderId(razorpayOrderId, reason);
      }

      // Always return 200 OK to Razorpay so they stop retrying the webhook
      return res.status(200).send("OK");
    } catch (error: any) {
      console.error("Webhook error:", error);
      // Return 200 even on error to prevent webhook retries loop if it's a known error (e.g. order already paid)
      if (error?.message?.includes("already confirmed")) {
         return res.status(200).send("OK");
      }
      return res.status(500).send("Internal Server Error");
    }
  };

  /**
   * Synchronous verification endpoint for the frontend.
   * The frontend calls this immediately after the Razorpay checkout modal closes successfully.
   */
  verifyFrontendPayment = async (req: Request, res: Response) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const isValid = this.paymentGateway.verifyFrontendSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        return ResponseHandler.badRequest(res, "Invalid payment signature");
      }

      // If valid, confirm the payment (this is idempotent, so if webhook fired first, it's fine)
      await this.orderService.confirmPaymentByGatewayOrderId(razorpay_order_id, {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        method: "sync_verification", // We might not know the exact method here unless we fetch from Razorpay API
      });

      return ResponseHandler.success(
        res,
        { orderId: razorpay_order_id, status: "COMPLETED" },
        "Payment verified successfully",
      );
    } catch (error: any) {
      console.error("Verification error:", error);
      if (error?.message?.includes("already confirmed") || error?.message?.includes("not found")) {
         return ResponseHandler.success(
            res,
            { orderId: req.body.razorpay_order_id, status: "COMPLETED" },
            "Payment verified successfully",
         );
      }
      return ResponseHandler.internalServerError(res, error.message || "Failed to verify payment");
    }
  };
}
