import { z } from "zod";

const PublicOptionValueSchema = z.object({
  id: z.string(),
  value: z.string(),
  sortOrder: z.number().int(),
});

const PublicOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  sortOrder: z.number().int(),
  values: z.array(PublicOptionValueSchema),
});

const AdminOptionValueSchema = PublicOptionValueSchema.extend({
  optionId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const AdminOptionSchema = PublicOptionSchema.extend({
  values: z.array(AdminOptionValueSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const OptionTypes = {
  ListOptions: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(PublicOptionSchema),
    }),
  },

  GetOptionById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicOptionSchema,
    }),
  },

  CreateOption: {
    body: z.object({
      name: z
        .string("Option name must be a string")
        .min(1, { message: "Option name is required" }),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminOptionSchema,
    }),
  },

  UpdateOption: {
    body: z.object({
      name: z.string().optional(),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminOptionSchema,
    }),
  },

  DeleteOption: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  CreateOptionValue: {
    body: z.object({
      value: z
        .string("Option value must be a string")
        .min(1, { message: "Option value is required" }),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({
      optionId: z
        .string("optionId must be a string")
        .min(1, { message: "optionId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminOptionValueSchema,
    }),
  },

  UpdateOptionValue: {
    body: z.object({
      value: z.string().min(1).optional(),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminOptionValueSchema,
    }),
  },

  DeleteOptionValue: {
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

export const OptionAdminTypes = {
  ListOptions: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminOptionSchema),
    }),
  },

  GetOptionById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminOptionSchema,
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof OptionTypes]: z.infer<(typeof OptionTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof OptionTypes]: z.infer<(typeof OptionTypes)[K]["params"]>;
};

export type QueryTypes = {
  [K in keyof typeof OptionTypes]: z.infer<(typeof OptionTypes)[K]["query"]>;
};

export type ResponseTypes = {
  [K in keyof typeof OptionTypes]: z.infer<(typeof OptionTypes)[K]["response"]>;
};

export type AdminBodyTypes = {
  [K in keyof typeof OptionAdminTypes]: z.infer<
    (typeof OptionAdminTypes)[K]["body"]
  >;
};

export type AdminParamsTypes = {
  [K in keyof typeof OptionAdminTypes]: z.infer<
    (typeof OptionAdminTypes)[K]["params"]
  >;
};

export type AdminQueryTypes = {
  [K in keyof typeof OptionAdminTypes]: z.infer<
    (typeof OptionAdminTypes)[K]["query"]
  >;
};

export type AdminResponseTypes = {
  [K in keyof typeof OptionAdminTypes]: z.infer<
    (typeof OptionAdminTypes)[K]["response"]
  >;
};
