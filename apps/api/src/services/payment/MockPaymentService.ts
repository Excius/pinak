import appConfig from "../../lib/config.js";
import {
  IPaymentGateway,
  PaymentSession,
  PaymentWebhookPayload,
} from "./IPaymentGateway.js";

export class MockPaymentService implements IPaymentGateway {
  async createPayment(input: {
    orderId: string;
    amount: number;
  }): Promise<PaymentSession> {
    return {
      id: `mock_payment_${input.orderId}`,
      method: "mock",
      amount: input.amount,
      currency: "INR",
      redirectUrl: `${appConfig.FRONTEND_URL}/payment/mock?orderId=${input.orderId}`,
    };
  }

  async verifyPayment(_payload: PaymentWebhookPayload): Promise<boolean> {
    return true;
  }
}
