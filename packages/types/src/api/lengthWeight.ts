import { z } from "zod";

const LengthClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const WeightClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LengthWeightTypes = {
  ListLength: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(LengthClassSchema),
    }),
  },
  GetLengthById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: LengthClassSchema,
    }),
  },
  CreateLength: {
    body: z.object({
      name: z
        .string("Length name must be a string")
        .min(1, { message: "Length name is required" }),
      unit: z
        .string("unit must be a string")
        .min(1, { message: "unit is required" })
        .max(64, { message: "unit must be at most 64 characters" }),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: LengthClassSchema,
    }),
  },
  UpdateLength: {
    body: z.object({
      name: z.string("name must be a string").optional(),
      unit: z
        .string("unit must be a string")
        .min(1, { message: "unit must be at least 1 character" })
        .max(64, { message: "unit must be at most 64 characters" })
        .optional(),
    }),
    params: z.object({
      id: z
        .string("length id must be a string")
        .min(1, { message: "length id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: LengthClassSchema,
    }),
  },
  DeleteLength: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  ListWeight: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(WeightClassSchema),
    }),
  },
  GetWeightById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: WeightClassSchema,
    }),
  },
  CreateWeight: {
    body: z.object({
      name: z.string().min(1),
      unit: z.string().min(1).max(64),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: WeightClassSchema,
    }),
  },
  UpdateWeight: {
    body: z.object({
      name: z.string().optional(),
      unit: z.string().min(1).max(64).optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: WeightClassSchema,
    }),
  },
  DeleteWeight: {
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
  [K in keyof typeof LengthWeightTypes]: z.infer<
    (typeof LengthWeightTypes)[K]["body"]
  >;
};

export type ParamsTypes = {
  [K in keyof typeof LengthWeightTypes]: z.infer<
    (typeof LengthWeightTypes)[K]["params"]
  >;
};

export type QueryTypes = {
  [K in keyof typeof LengthWeightTypes]: z.infer<
    (typeof LengthWeightTypes)[K]["query"]
  >;
};

export type ResponseTypes = {
  [K in keyof typeof LengthWeightTypes]: z.infer<
    (typeof LengthWeightTypes)[K]["response"]
  >;
};
