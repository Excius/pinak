import axiosInstance from "./axiosInstance";

// ── Cart Types ─────────────────────────────────────────────────────────

export interface CartVariantImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface CartVariant {
  id: string;
  sku: string;
  price: number;
  taxAmount?: number;
  priceWithTax?: number;
  sellingPrice?: number | null;
  sellingPriceWithTax?: number | null;
  isActive: boolean;
  image: CartVariantImage | null;
  optionValues: { optionName: string; valueName: string }[];
  product: {
    id: string;
    name: string;
    slug: string;
    frontImageUrl: string | null;
    brand: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
    } | null;
  };
}

export interface CartComboKit {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  itemType: "PRODUCT_VARIANT" | "COMBO_KIT";
  quantity: number;
  unitPrice: number;
  unitPriceWithTax?: number;
  price?: number;
  priceWithTax?: number;
  sellingPrice?: number | null;
  sellingPriceWithTax?: number | null;
  taxAmount?: number;
  lineTotal: number;
  lineTotalWithTax?: number;
  availableStock: number;
  productVariantId: string | null;
  comboKitId: string | null;
  productVariant: CartVariant | null;
  comboKit: CartComboKit | null;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  total: number;
  taxTotal?: number;
  totalWithTax?: number;
  /** Shipping charge in paise (0 when nothing needs shipping). */
  shippingFee?: number;
  /** True if any item requires physical shipping. */
  shippingRequired?: boolean;
  /** Final total in paise: totalWithTax + shippingFee. */
  grandTotal?: number;
}

// ── Cart API ───────────────────────────────────────────────────────────

export const getCart = async (): Promise<Cart> => {
  const { data: resp } = await axiosInstance.get("/cart");
  return resp?.data as Cart;
};

export const addToCart = async (payload: {
  productVariantId?: string;
  comboKitId?: string;
  quantity?: number;
}): Promise<Cart> => {
  const { data: resp } = await axiosInstance.post("/cart/items", payload);
  return resp?.data as Cart;
};

export const updateCartItem = async (
  itemId: string,
  quantity: number,
): Promise<Cart> => {
  const { data: resp } = await axiosInstance.put(`/cart/items/${itemId}`, {
    quantity,
  });
  return resp?.data as Cart;
};

export const removeCartItem = async (itemId: string): Promise<Cart> => {
  const { data: resp } = await axiosInstance.delete(`/cart/items/${itemId}`);
  return resp?.data as Cart;
};

export const clearCart = async (): Promise<Cart> => {
  const { data: resp } = await axiosInstance.delete("/cart");
  return resp?.data as Cart;
};

// ── Order Types ────────────────────────────────────────────────────────

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface OrderAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productVariantId: string | null;
  comboKitId: string | null;
  productName: string;
  price: number;
  quantity: number;
  lineTotal: number;
  basePrice?: number;
  priceWithTax?: number;
  sellingPrice?: number | null;
  sellingPriceWithTax?: number | null;
  variantDetails?: {
    price: number;
    basePrice: number;
    priceWithTax: number;
    sellingPrice: number | null;
    sellingPriceWithTax: number | null;
  };
}

export interface Order {
  id: string;
  userId: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDING" | "REFUNDED" | "REFUND_FAILED";
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  items: OrderItem[];
  totalItems: number;
  couponCode?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  shippingAddress?: OrderAddress | null;
  billingAddress?: OrderAddress | null;
  createdAt: string;
  updatedAt: string;
}

// ── Order API ──────────────────────────────────────────────────────────

export const createOrder = async (payload: {
  shippingAddressId: string;
  couponCode?: string;
}): Promise<{ order: Order; payment: any }> => {
  const { data: resp } = await axiosInstance.post("/orders", payload);
  return resp?.data as { order: Order; payment: any };
};

export const getMyOrders = async (): Promise<{
  items: Order[];
  pagination: any;
}> => {
  const { data: resp } = await axiosInstance.get("/orders");
  return resp?.data as { items: Order[]; pagination: any };
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  const { data: resp } = await axiosInstance.get(`/orders/${orderId}`);
  return resp?.data as Order;
};

export const cancelOrder = async (orderId: string): Promise<Order> => {
  const { data: resp } = await axiosInstance.put(`/orders/${orderId}/cancel`);
  return resp?.data as Order;
};

/** Receipt / tax invoice as a PDF (requires auth, so it is fetched as a blob). */
export const getOrderReceiptPdf = async (orderId: string): Promise<Blob> => {
  const { data } = await axiosInstance.get(`/orders/${orderId}/invoice/pdf`, {
    responseType: "blob",
  });
  return data as Blob;
};

// ── Payment Verification ──────────────────────────────────────────────

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  orderId: string;
  status: string;
}

export const verifyPayment = async (
  payload: VerifyPaymentPayload,
): Promise<VerifyPaymentResponse> => {
  const { data: resp } = await axiosInstance.post("/payments/verify", payload);
  return resp?.data as VerifyPaymentResponse;
};
