import { z } from "zod";
import { ProductTypes } from "./product.js";

// We extract the underlying schemas from ProductTypes
const PublicProductListSchema = ProductTypes.GetProducts.response.shape.data;
const AdminProductListSchema = ProductTypes.GetAllProductsAdmin.response.shape.data;
const PaginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const BestSellerTimeframe = z.enum(["all_time", "month", "week"]);
export type BestSellerTimeframe = z.infer<typeof BestSellerTimeframe>;

export const GetBestSellersSchema = z.object({
  query: PaginationSchema.extend({
    timeframe: BestSellerTimeframe.optional().default("all_time"),
    categoryId: z.string().uuid("Invalid category ID").optional(),
  }),
});

export const AdminBestSellerItemSchema = z.object({
  // the individual admin product record structure
  product: AdminProductListSchema.shape.items.element,
  salesMetrics: z.object({
    unitsSold: z.number().int().nonnegative(),
    totalRevenue: z.number().nonnegative(),
    timeframe: BestSellerTimeframe,
  }),
});

export const AdminBestSellersListSchema = z.object({
  items: z.array(AdminBestSellerItemSchema),
  pagination: AdminProductListSchema.shape.pagination,
});

export const GetBestSellersAdminSchema = z.object({
  query: PaginationSchema.extend({
    timeframe: BestSellerTimeframe.optional().default("all_time"),
    categoryId: z.string().uuid("Invalid category ID").optional(),
  }),
});

export const GetBestSellerAnalyticsSchema = z.object({
  query: z.object({
    timeframe: BestSellerTimeframe.optional().default("month"),
  }),
});

export const BestSellerAnalyticsResponseSchema = z.object({
  totalUnitsSold: z.number().int().nonnegative(),
  grossRevenue: z.number().nonnegative(),
  topCategory: z.string().nullable(),
  timeframe: BestSellerTimeframe,
});

export const BestSellerTypes = {
  GetBestSellers: {
    body: z.object({}),
    params: z.object({}),
    query: GetBestSellersSchema.shape.query,
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicProductListSchema,
    }),
  },
  GetBestSellersAdmin: {
    body: z.object({}),
    params: z.object({}),
    query: GetBestSellersAdminSchema.shape.query,
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminBestSellersListSchema,
    }),
  },
  GetBestSellerAnalytics: {
    body: z.object({}),
    params: z.object({}),
    query: GetBestSellerAnalyticsSchema.shape.query,
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: BestSellerAnalyticsResponseSchema,
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof BestSellerTypes]: z.infer<
    (typeof BestSellerTypes)[K]["body"]
  >;
};

export type ParamsTypes = {
  [K in keyof typeof BestSellerTypes]: z.infer<
    (typeof BestSellerTypes)[K]["params"]
  >;
};

export type QueryTypes = {
  [K in keyof typeof BestSellerTypes]: z.infer<
    (typeof BestSellerTypes)[K]["query"]
  >;
};

export type ResponseTypes = {
  [K in keyof typeof BestSellerTypes]: z.infer<
    (typeof BestSellerTypes)[K]["response"]
  >;
};
