import { z } from "zod";

const CouponDiscountTypeSchema = z.enum(["PERCENTAGE", "FLAT"]);

const PublicCouponSchema = z.object({
  id: z.string(),
  code: z.string(),
  discountType: CouponDiscountTypeSchema,
  discountValue: z.number(),
  minOrderValue: z.number().nullable(),
  maxDiscountValue: z.number().nullable(),
});

const AdminCouponSchema = z.object({
  id: z.string(),
  code: z.string(),
  discountType: CouponDiscountTypeSchema,
  discountValue: z.number(),
  minOrderValue: z.number().nullable(),
  maxDiscountValue: z.number().nullable(),
  maxTotalUsers: z.number().nullable(),
  maxUsesPerUser: z.number().nullable(),
  validFrom: z.date(),
  validUntil: z.date(),
  isActive: z.boolean(),
});

export const CouponTypes = {
  ValidateCoupon: {
    body: z.object({
      code: z
        .string("Coupon code must be a string")
        .min(1, { message: "Coupon code is required" }),
      cartTotal: z.coerce.number().min(0, { message: "cartTotal must be >= 0" }),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        valid: z.literal(true),
        discountAmount: z.number().min(0),
        coupon: PublicCouponSchema,
      }),
    }),
  },
  GetCoupon: {
    body: z.object({}),
    params: z.object({
      code: z
        .string("Coupon code must be a string")
        .min(1, { message: "Coupon code is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicCouponSchema,
    }),
  },
  AdminValidateCoupon: {
    body: z.object({
      code: z
        .string("Coupon code must be a string")
        .min(1, { message: "Coupon code is required" }),
      cartTotal: z.coerce.number().min(0, { message: "cartTotal must be >= 0" }),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        valid: z.literal(true),
        discountAmount: z.number().min(0),
        coupon: AdminCouponSchema,
      }),
    }),
  },
  AdminGetCoupon: {
    body: z.object({}),
    params: z.object({
      code: z
        .string("Coupon code must be a string")
        .min(1, { message: "Coupon code is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminCouponSchema,
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof CouponTypes]: z.infer<(typeof CouponTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof CouponTypes]: z.infer<(typeof CouponTypes)[K]["params"]>;
};

export type QueryTypes = {
  [K in keyof typeof CouponTypes]: z.infer<(typeof CouponTypes)[K]["query"]>;
};

export type ResponseTypes = {
  [K in keyof typeof CouponTypes]: z.infer<(typeof CouponTypes)[K]["response"]>;
};
