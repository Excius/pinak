import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { OrderService } from "../services/order.service.js";
import {
  IPaymentGateway,
  PaymentWebhookPayload,
} from "../services/payment/IPaymentGateway.js";

export class PaymentController {
  constructor(
    private orderService: OrderService,
    private paymentGateway: IPaymentGateway,
  ) {}

  handlePaymentWebhook = async (req: Request, res: Response) => {
    const payload = req.body as PaymentWebhookPayload;

    const isValid = await this.paymentGateway.verifyPayment(payload);
    if (!isValid) {
      return ResponseHandler.badRequest(res, "Invalid payment signature");
    }

    if (payload.status === "SUCCESS") {
      await this.orderService.confirmPayment(payload.orderId, payload);
      return ResponseHandler.success(
        res,
        { orderId: payload.orderId, status: "COMPLETED" },
        "Payment confirmed successfully",
      );
    }

    await this.orderService.handlePaymentFailure(
      payload.orderId,
      payload.reason ?? "Payment failed",
    );
    return ResponseHandler.success(
      res,
      { orderId: payload.orderId, status: "FAILED" },
      "Payment failure processed successfully",
    );
  };
}
