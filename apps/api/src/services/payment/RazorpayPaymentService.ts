import Razorpay from "razorpay";
import crypto from "crypto";
import appConfig from "../../lib/config.js";
import {
  IPaymentGateway,
  PaymentSession,
  PaymentWebhookPayload,
} from "./IPaymentGateway.js";

export class RazorpayPaymentService implements IPaymentGateway {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: appConfig.RAZORPAY_KEY_ID,
      key_secret: appConfig.RAZORPAY_KEY_SECRET,
    });
  }

  async createPayment(input: {
    orderId: string;
    amount: number;
  }): Promise<PaymentSession> {
    // Razorpay amount is in paise.
    // Our internal system stores amounts in paise (smallest unit) to avoid floating point errors.
    const razorpayOrder = await this.razorpay.orders.create({
      amount: input.amount,
      currency: "INR",
      receipt: input.orderId,
    });

    return {
      id: razorpayOrder.id, // This is the gatewayOrderId
      method: "razorpay",
      amount: razorpayOrder.amount as number,
      currency: razorpayOrder.currency,
      redirectUrl: "", // Frontend will open SDK instead of redirecting
      timeout: Math.max(1, appConfig.STOCK_RESERVATION_EXPIRE_SECONDS - 120),
    };
  }

  async verifyPayment(payload: PaymentWebhookPayload): Promise<boolean> {
    if (!payload.signature) {
      return false;
    }

    // Razorpay webhook signature verification
    // Payload should contain the raw stringified body of the webhook
    const expectedSignature = crypto
      .createHmac("sha256", appConfig.RAZORPAY_WEBHOOK_SECRET)
      .update(payload.orderId) // In webhook context, orderId here is the raw body string passed by the controller
      .digest("hex");

    return expectedSignature === payload.signature;
  }

  /**
   * Verifies the synchronous signature returned by the frontend SDK checkout modal
   */
  verifyFrontendSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): boolean {
    const text = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", appConfig.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");
    return expectedSignature === razorpaySignature;
  }

  /**
   * Triggers an automatic refund via Razorpay Payments API
   */
  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<any> {
    const refundData: Record<string, unknown> = {};
    if (amount) refundData.amount = amount;
    if (reason) refundData.notes = { reason };

    return this.razorpay.payments.refund(paymentId, refundData);
  }
}
