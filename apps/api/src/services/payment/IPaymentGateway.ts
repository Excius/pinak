export type PaymentSession = {
  id: string;
  method: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  timeout?: number;
};

export type PaymentWebhookPayload = {
  orderId: string;
  paymentId?: string;
  status: "SUCCESS" | "FAILED";
  signature?: string;
  reason?: string;
};

export interface IPaymentGateway {
  createPayment(input: {
    orderId: string;
    amount: number;
  }): Promise<PaymentSession>;
  verifyPayment(payload: PaymentWebhookPayload): Promise<boolean>;
  refundPayment?(
    paymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<any>;
  /** Reads a refund back from the gateway to verify its current status. */
  fetchRefund?(refundId: string): Promise<any>;
  /** Lists the refunds already issued against a payment. */
  fetchPaymentRefunds?(paymentId: string): Promise<any>;
}
