import { z } from "zod";

const AssetTypeSchema = z.enum(["IMAGE", "VIDEO", "DOCUMENT"]);

const PublicDynamicAssetSchema = z.object({
  id: z.string(),
  slug: z.string(),
  url: z.string(),
  type: AssetTypeSchema,
  title: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
});

const AdminDynamicAssetSchema = PublicDynamicAssetSchema.extend({
  s3Key: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const DynamicAssetTypes = {
  ListDynamicAssets: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(PublicDynamicAssetSchema),
    }),
  },

  GetDynamicAssetBySlug: {
    body: z.object({}),
    params: z.object({
      slug: z
        .string("slug must be a string")
        .min(1, { message: "slug is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicDynamicAssetSchema,
    }),
  },
};

export const DynamicAssetAdminTypes = {
  AdminListDynamicAssets: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      includeDeleted: z.coerce.boolean().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminDynamicAssetSchema),
    }),
  },

  AdminGetDynamicAsset: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "asset id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminDynamicAssetSchema,
    }),
  },

  CreateDynamicAsset: {
    body: z.object({
      slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
          message: "slug must be lowercase alphanumeric with hyphens",
        }),
      type: AssetTypeSchema.optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      metadata: z.any().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminDynamicAssetSchema,
    }),
  },

  UpdateDynamicAsset: {
    body: z.object({
      slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
          message: "slug must be lowercase alphanumeric with hyphens",
        })
        .optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      type: AssetTypeSchema.optional(),
      isActive: z.coerce.boolean().optional(),
      metadata: z.any().optional(),
    }),
    params: z.object({
      id: z.string().min(1, { message: "asset id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminDynamicAssetSchema,
    }),
  },

  ReplaceAssetFile: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "asset id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminDynamicAssetSchema,
    }),
  },

  SoftDeleteDynamicAsset: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "asset id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RestoreDynamicAsset: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "asset id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminDynamicAssetSchema,
    }),
  },

  HardDeleteDynamicAsset: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "asset id is required" }),
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
  [K in keyof typeof DynamicAssetTypes]: z.infer<
    (typeof DynamicAssetTypes)[K]["body"]
  >;
};

export type ParamsTypes = {
  [K in keyof typeof DynamicAssetTypes]: z.infer<
    (typeof DynamicAssetTypes)[K]["params"]
  >;
};

export type QueryTypes = {
  [K in keyof typeof DynamicAssetTypes]: z.infer<
    (typeof DynamicAssetTypes)[K]["query"]
  >;
};

export type ResponseTypes = {
  [K in keyof typeof DynamicAssetTypes]: z.infer<
    (typeof DynamicAssetTypes)[K]["response"]
  >;
};
