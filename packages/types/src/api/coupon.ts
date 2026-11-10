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

const couponCodeSchema = z
  .string("Coupon code must be a string")
  .trim()
  .min(3, { message: "Coupon code must be at least 3 characters" })
  .max(50, { message: "Coupon code must be at most 50 characters" })
  .regex(/^[A-Za-z0-9_-]+$/, {
    message: "Coupon code may only contain letters, numbers, '-' and '_'",
  })
  .transform((v) => v.toUpperCase());

const nullablePositiveInt = z.number().int().min(1).nullable();
const nullableNonNegativeInt = z.number().int().min(0).nullable();

const AdminCouponBodyShape = {
  code: couponCodeSchema,
  discountType: CouponDiscountTypeSchema,
  discountValue: z.number().int().min(1, { message: "discountValue must be >= 1" }),
  // NOTE: `minOderValue` mirrors the (misspelled) database column name.
  minOderValue: nullableNonNegativeInt,
  maxDiscountValue: nullableNonNegativeInt,
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  maxTotalUsers: nullablePositiveInt,
  maxUsesPerUser: nullablePositiveInt,
  isActive: z.boolean(),
};

const AdminCouponRecordSchema = z.object({
  id: z.string(),
  code: z.string(),
  discountType: CouponDiscountTypeSchema,
  discountValue: z.number(),
  minOderValue: z.number().nullable(),
  maxDiscountValue: z.number().nullable(),
  validFrom: z.date(),
  validUntil: z.date(),
  maxTotalUsers: z.number().nullable(),
  maxUsesPerUser: z.number().nullable(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CouponIdParams = z.object({
  id: z.string().min(1, { message: "id is required" }),
});

export const CouponTypes = {
  ValidateCoupon: {
    body: z.object({
      code: z
        .string("Coupon code must be a string")
        .min(1, { message: "Coupon code is required" }),
      cartTotal: z.coerce
        .number()
        .min(0, { message: "cartTotal must be >= 0" }),
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
      cartTotal: z.coerce
        .number()
        .min(0, { message: "cartTotal must be >= 0" }),
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
  AdminListCoupons: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      search: z.string().trim().max(100).optional(),
      isActive: z.enum(["true", "false"]).optional(),
      deleted: z.enum(["true", "false"]).optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        items: z.array(AdminCouponRecordSchema),
        pagination: z.object({
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          totalPages: z.number(),
        }),
      }),
    }),
  },
  AdminCreateCoupon: {
    body: z.object({
      ...AdminCouponBodyShape,
      minOderValue: AdminCouponBodyShape.minOderValue.optional().default(null),
      maxDiscountValue: AdminCouponBodyShape.maxDiscountValue.optional().default(null),
      maxTotalUsers: AdminCouponBodyShape.maxTotalUsers.optional().default(null),
      maxUsesPerUser: AdminCouponBodyShape.maxUsesPerUser.optional().default(null),
      isActive: AdminCouponBodyShape.isActive.optional().default(true),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminCouponRecordSchema,
    }),
  },
  AdminUpdateCoupon: {
    body: z.object(AdminCouponBodyShape).partial(),
    params: CouponIdParams,
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminCouponRecordSchema,
    }),
  },
  AdminUpdateCouponStatus: {
    body: z.object({ isActive: z.boolean() }),
    params: CouponIdParams,
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminCouponRecordSchema,
    }),
  },
  AdminSoftDeleteCoupon: {
    body: z.object({}),
    params: CouponIdParams,
    query: z.object({}),
    response: z.object({ message: z.string(), success: z.boolean() }),
  },
  AdminRestoreCoupon: {
    body: z.object({}),
    params: CouponIdParams,
    query: z.object({}),
    response: z.object({ message: z.string(), success: z.boolean() }),
  },
  AdminHardDeleteCoupon: {
    body: z.object({}),
    params: CouponIdParams,
    query: z.object({}),
    response: z.object({ message: z.string(), success: z.boolean() }),
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
