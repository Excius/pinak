import { z } from "zod";

const PublicFilterValueSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sortOrder: z.number().int(),
});

const PublicFilterGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  values: z.array(PublicFilterValueSchema),
});

const AdminFilterValueSchema = PublicFilterValueSchema.extend({
  filterGroupId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const AdminFilterGroupSchema = PublicFilterGroupSchema.extend({
  values: z.array(AdminFilterValueSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const ProductFilterValueSchema = z.object({
  productId: z.string(),
  filterValueId: z.string(),
});

export const FilterTypes = {
  ListGroups: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({ activeOnly: z.coerce.boolean().optional() }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(PublicFilterGroupSchema),
    }),
  },

  GetGroupById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicFilterGroupSchema,
    }),
  },

  CreateGroup: {
    body: z.object({
      name: z
        .string("Filter group name must be a string")
        .min(1, { message: "Filter group name is required" }),
      slug: z.string("slug must be a string").optional(),
      sortOrder: z.coerce.number().optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminFilterGroupSchema,
    }),
  },

  UpdateGroup: {
    body: z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      sortOrder: z.coerce.number().optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminFilterGroupSchema,
    }),
  },

  DeleteGroup: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  CreateValue: {
    body: z.object({
      name: z
        .string("Filter value name must be a string")
        .min(1, { message: "Filter value name is required" }),
      slug: z.string("slug must be a string").optional(),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({
      groupId: z
        .string("groupId must be a string")
        .min(1, { message: "groupId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminFilterValueSchema,
    }),
  },

  UpdateValue: {
    body: z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminFilterValueSchema,
    }),
  },

  DeleteValue: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  AddFilterToProduct: {
    body: z.object({}),
    params: z.object({ productId: z.string(), filterValueId: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: ProductFilterValueSchema,
    }),
  },

  RemoveFilterFromProduct: {
    body: z.object({}),
    params: z.object({ productId: z.string(), filterValueId: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },
};

export const FilterAdminTypes = {
  ListGroups: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({ activeOnly: z.coerce.boolean().optional() }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminFilterGroupSchema),
    }),
  },

  GetGroupById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminFilterGroupSchema,
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof FilterTypes]: z.infer<(typeof FilterTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof FilterTypes]: z.infer<(typeof FilterTypes)[K]["params"]>;
};

export type QueryTypes = {
  [K in keyof typeof FilterTypes]: z.infer<(typeof FilterTypes)[K]["query"]>;
};

export type ResponseTypes = {
  [K in keyof typeof FilterTypes]: z.infer<(typeof FilterTypes)[K]["response"]>;
};

export type AdminBodyTypes = {
  [K in keyof typeof FilterAdminTypes]: z.infer<
    (typeof FilterAdminTypes)[K]["body"]
  >;
};

export type AdminParamsTypes = {
  [K in keyof typeof FilterAdminTypes]: z.infer<
    (typeof FilterAdminTypes)[K]["params"]
  >;
};

export type AdminQueryTypes = {
  [K in keyof typeof FilterAdminTypes]: z.infer<
    (typeof FilterAdminTypes)[K]["query"]
  >;
};

export type AdminResponseTypes = {
  [K in keyof typeof FilterAdminTypes]: z.infer<
    (typeof FilterAdminTypes)[K]["response"]
  >;
};
