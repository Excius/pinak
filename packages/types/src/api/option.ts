import { z } from "zod";

const OptionValueSchema = z.object({
  id: z.string(),
  optionId: z.string(),
  value: z.string(),
  sortOrder: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const OptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  sortOrder: z.number().int(),
  values: z.array(OptionValueSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const OptionTypes = {
  ListOptions: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(OptionSchema),
    }),
  },
  GetOptionById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: OptionSchema,
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
      data: OptionSchema,
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
      data: OptionSchema,
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
      data: OptionValueSchema,
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
      data: OptionValueSchema,
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
