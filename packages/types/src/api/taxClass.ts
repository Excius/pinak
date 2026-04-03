import { z } from "zod";

const TaxClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  rate: z.number(),
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
      data: z.array(TaxClassSchema),
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
      data: TaxClassSchema,
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
      data: TaxClassSchema,
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
      data: TaxClassSchema,
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
