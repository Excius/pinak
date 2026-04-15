import { z } from "zod";

const PublicBrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  isActive: z.boolean(),
});

const AdminBrandSchema = PublicBrandSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BrandTypes = {
  ListBrands: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({ activeOnly: z.coerce.boolean().optional() }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(PublicBrandSchema),
    }),
  },

  GetBrandById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("brand id must be a string")
        .min(1, { message: "brand id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicBrandSchema,
    }),
  },

  GetBrandBySlug: {
    body: z.object({}),
    params: z.object({ slug: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicBrandSchema,
    }),
  },

  CreateBrand: {
    body: z.object({
      name: z
        .string("Brand name must be a string")
        .min(1, { message: "Brand name is required" }),
      slug: z.string("slug must be a string").optional(),
      logoUrl: z
        .string("logoUrl must be a string")
        .url({ message: "logoUrl must be a valid URL" })
        .optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminBrandSchema,
    }),
  },

  UpdateBrand: {
    body: z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      logoUrl: z.string().url().optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminBrandSchema,
    }),
  },

  DeleteBrand: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },
};

export const BrandAdminTypes = {
  ListBrands: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({ activeOnly: z.coerce.boolean().optional() }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminBrandSchema),
    }),
  },

  GetBrandById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("brand id must be a string")
        .min(1, { message: "brand id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminBrandSchema,
    }),
  },

  GetBrandBySlug: {
    body: z.object({}),
    params: z.object({ slug: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminBrandSchema,
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof BrandTypes]: z.infer<(typeof BrandTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof BrandTypes]: z.infer<(typeof BrandTypes)[K]["params"]>;
};

export type QueryTypes = {
  [K in keyof typeof BrandTypes]: z.infer<(typeof BrandTypes)[K]["query"]>;
};

export type ResponseTypes = {
  [K in keyof typeof BrandTypes]: z.infer<(typeof BrandTypes)[K]["response"]>;
};

export type AdminBodyTypes = {
  [K in keyof typeof BrandAdminTypes]: z.infer<
    (typeof BrandAdminTypes)[K]["body"]
  >;
};

export type AdminParamsTypes = {
  [K in keyof typeof BrandAdminTypes]: z.infer<
    (typeof BrandAdminTypes)[K]["params"]
  >;
};

export type AdminQueryTypes = {
  [K in keyof typeof BrandAdminTypes]: z.infer<
    (typeof BrandAdminTypes)[K]["query"]
  >;
};

export type AdminResponseTypes = {
  [K in keyof typeof BrandAdminTypes]: z.infer<
    (typeof BrandAdminTypes)[K]["response"]
  >;
};
