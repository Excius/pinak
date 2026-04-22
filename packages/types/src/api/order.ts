import { z } from "zod";
import { UserSchema } from "../user.js";

const OrderStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

const PaymentStatusSchema = z.enum(["PENDING", "COMPLETED", "FAILED"]);

const AddressSchema = z.object({
  fullName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable().optional(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  phone: z.string(),
});

const OrderItemSchema = z.object({
  id: z.string(),
  productId: z.string().nullable(),
  productVariantId: z.string().nullable(),
  comboKitId: z.string().nullable(),
  productName: z.string(),
  variantDetails: z.record(z.string(), z.unknown()).nullable(),
  price: z.number(),
  quantity: z.number().int().min(1),
  lineTotal: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const OrderBaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  subtotalAmount: z.number().min(0),
  taxAmount: z.number().min(0),
  discountAmount: z.number().min(0),
  shippingAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  couponCode: z.string().nullable(),
  couponDiscount: z.number().min(0),
  reservationExpiresAt: z.date().nullable(),
  shippingAddress: AddressSchema.nullable(),
  billingAddress: AddressSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const OrderSummarySchema = OrderBaseSchema.extend({
  totalItems: z.number().int().min(0),
});

const OrderDetailsSchema = OrderBaseSchema.extend({
  items: z.array(OrderItemSchema),
  totalItems: z.number().int().min(0),
});

const AdminOrderDetailsSchema = OrderDetailsSchema.extend({
  gstPercentage: z.number(),
  gstNumber: z.string().nullable(),
  getBreakup: z.record(z.string(), z.unknown()).nullable(),
  user: UserSchema,
});

const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const OrderTypes = {
  CreateOrder: {
    body: z.object({
      couponCode: z.string().optional(),
      shippingAddress: AddressSchema,
      billingAddress: AddressSchema.optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        order: OrderDetailsSchema,
        payment: z.object({
          paymentId: z.string().nullable(),
          clientSecret: z.string().nullable(),
          amount: z.number(),
          currency: z.string(),
          status: z.string(),
        }),
      }),
    }),
  },
  GetOrders: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      status: OrderStatusSchema.optional(),
      paymentStatus: PaymentStatusSchema.optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        items: z.array(OrderDetailsSchema),
        pagination: PaginationSchema,
      }),
    }),
  },
  GetOrderById: {
    body: z.object({}),
    params: z.object({
      orderId: z.string().min(1, { message: "orderId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: OrderDetailsSchema,
    }),
  },
  CancelOrder: {
    body: z.object({}),
    params: z.object({
      orderId: z.string().min(1, { message: "orderId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: OrderDetailsSchema,
    }),
  },
  PaymentWebhook: {
    body: z.object({
      orderId: z.string(),
      paymentId: z.string().optional(),
      status: z.enum(["SUCCESS", "FAILED"]),
      signature: z.string().optional(),
      reason: z.string().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        orderId: z.string(),
        status: z.string(),
      }),
    }),
  },
};

export const OrderAdminTypes = {
  ListOrders: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      status: OrderStatusSchema.optional(),
      paymentStatus: PaymentStatusSchema.optional(),
      userId: z.string().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        orders: z.array(AdminOrderDetailsSchema),
        pagination: PaginationSchema,
      }),
    }),
  },
  UpdateOrderStatus: {
    body: z.object({
      status: OrderStatusSchema,
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminOrderDetailsSchema,
    }),
  },
  UpdatePaymentStatus: {
    body: z.object({
      paymentStatus: PaymentStatusSchema,
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminOrderDetailsSchema,
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof OrderTypes]: z.infer<(typeof OrderTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof OrderTypes]: z.infer<(typeof OrderTypes)[K]["params"]>;
};

export type QueryTypes = {
  [K in keyof typeof OrderTypes]: z.infer<(typeof OrderTypes)[K]["query"]>;
};

export type ResponseTypes = {
  [K in keyof typeof OrderTypes]: z.infer<(typeof OrderTypes)[K]["response"]>;
};

export type AdminBodyTypes = {
  [K in keyof typeof OrderAdminTypes]: z.infer<
    (typeof OrderAdminTypes)[K]["body"]
  >;
};

export type AdminParamsTypes = {
  [K in keyof typeof OrderAdminTypes]: z.infer<
    (typeof OrderAdminTypes)[K]["params"]
  >;
};

export type AdminQueryTypes = {
  [K in keyof typeof OrderAdminTypes]: z.infer<
    (typeof OrderAdminTypes)[K]["query"]
  >;
};

export type AdminResponseTypes = {
  [K in keyof typeof OrderAdminTypes]: z.infer<
    (typeof OrderAdminTypes)[K]["response"]
  >;
};
