import { z } from "zod";

const PublicTaxClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  rate: z.number(),
});

const AdminTaxClassSchema = PublicTaxClassSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TaxClassTypes = {
  List: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(PublicTaxClassSchema),
    }),
  },
  GetById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("taxClass id must be a string")
        .min(1, { message: "taxClass id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicTaxClassSchema,
    }),
  },
  Create: {
    body: z.object({
      name: z
        .string("Tax class name must be a string")
        .min(1, { message: "Tax class name is required" }),
      rate: z.coerce.number().min(0, { message: "rate must be >= 0" }),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminTaxClassSchema,
    }),
  },
  Update: {
    body: z.object({
      name: z.string("name must be a string").optional(),
      rate: z.coerce
        .number()
        .min(0, { message: "rate must be >= 0" })
        .optional(),
    }),
    params: z.object({
      id: z
        .string("taxClass id must be a string")
        .min(1, { message: "taxClass id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminTaxClassSchema,
    }),
  },
  Delete: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("taxClass id must be a string")
        .min(1, { message: "taxClass id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },
};

export const TaxClassAdminTypes = {
  List: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminTaxClassSchema),
    }),
  },
  GetById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("taxClass id must be a string")
        .min(1, { message: "taxClass id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminTaxClassSchema,
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof TaxClassTypes]: z.infer<(typeof TaxClassTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof TaxClassTypes]: z.infer<
    (typeof TaxClassTypes)[K]["params"]
  >;
};

export type QueryTypes = {
  [K in keyof typeof TaxClassTypes]: z.infer<
    (typeof TaxClassTypes)[K]["query"]
  >;
};

export type ResponseTypes = {
  [K in keyof typeof TaxClassTypes]: z.infer<
    (typeof TaxClassTypes)[K]["response"]
  >;
};

export type AdminBodyTypes = {
  [K in keyof typeof TaxClassAdminTypes]: z.infer<
    (typeof TaxClassAdminTypes)[K]["body"]
  >;
};

export type AdminParamsTypes = {
  [K in keyof typeof TaxClassAdminTypes]: z.infer<
    (typeof TaxClassAdminTypes)[K]["params"]
  >;
};

export type AdminQueryTypes = {
  [K in keyof typeof TaxClassAdminTypes]: z.infer<
    (typeof TaxClassAdminTypes)[K]["query"]
  >;
};

export type AdminResponseTypes = {
  [K in keyof typeof TaxClassAdminTypes]: z.infer<
    (typeof TaxClassAdminTypes)[K]["response"]
  >;
};
