export type PaymentSession = {
  id: string;
  method: string;
  amount: number;
  currency: string;
  redirectUrl: string;
};

export type PaymentWebhookPayload = {
  orderId: string;
  paymentId?: string;
  status: "SUCCESS" | "FAILED";
  signature?: string;
  reason?: string;
};

export interface IPaymentGateway {
  createPayment(input: { orderId: string; amount: number }): Promise<PaymentSession>;
  verifyPayment(payload: PaymentWebhookPayload): Promise<boolean>;
}
