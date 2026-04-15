import { z } from "zod";

const PublicLengthClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
});

const AdminLengthClassSchema = PublicLengthClassSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

const PublicWeightClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
});

const AdminWeightClassSchema = PublicWeightClassSchema.extend({
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
      data: z.array(PublicLengthClassSchema),
    }),
  },
  GetLengthById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicLengthClassSchema,
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
      data: AdminLengthClassSchema,
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
      data: AdminLengthClassSchema,
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
      data: z.array(PublicWeightClassSchema),
    }),
  },
  GetWeightById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicWeightClassSchema,
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
      data: AdminWeightClassSchema,
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
      data: AdminWeightClassSchema,
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

export const LengthWeightAdminTypes = {
  ListLength: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminLengthClassSchema),
    }),
  },
  GetLengthById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminLengthClassSchema,
    }),
  },
  ListWeight: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminWeightClassSchema),
    }),
  },
  GetWeightById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminWeightClassSchema,
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

export type AdminBodyTypes = {
  [K in keyof typeof LengthWeightAdminTypes]: z.infer<
    (typeof LengthWeightAdminTypes)[K]["body"]
  >;
};

export type AdminParamsTypes = {
  [K in keyof typeof LengthWeightAdminTypes]: z.infer<
    (typeof LengthWeightAdminTypes)[K]["params"]
  >;
};

export type AdminQueryTypes = {
  [K in keyof typeof LengthWeightAdminTypes]: z.infer<
    (typeof LengthWeightAdminTypes)[K]["query"]
  >;
};

export type AdminResponseTypes = {
  [K in keyof typeof LengthWeightAdminTypes]: z.infer<
    (typeof LengthWeightAdminTypes)[K]["response"]
  >;
};
