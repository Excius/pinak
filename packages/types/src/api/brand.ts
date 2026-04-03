import { z } from "zod";

const BrandResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  isActive: z.boolean(),
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
      data: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          isActive: z.boolean(),
        }),
      ),
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
      data: BrandResponseSchema,
    }),
  },

  GetBrandBySlug: {
    body: z.object({}),
    params: z.object({ slug: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: BrandResponseSchema,
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
      data: BrandResponseSchema,
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
      data: BrandResponseSchema,
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
