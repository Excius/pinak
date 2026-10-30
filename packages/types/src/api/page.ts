import { z } from "zod";

export const PublicPageSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  updatedAt: z.date().or(z.string()),
});

export const PublicPageSchema = PublicPageSummarySchema.extend({
  content: z.string(),
});

export const AdminPageSchema = PublicPageSchema.extend({
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.date().or(z.string()),
});

export const PagePaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const PageTypes = {
  ListPages: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(PublicPageSummarySchema),
    }),
  },

  GetPageBySlug: {
    body: z.object({}),
    params: z.object({
      slug: z
        .string("slug must be a string")
        .trim()
        .min(1, { message: "slug is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicPageSchema,
    }),
  },
};

export const PageAdminTypes = {
  ListPages: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      search: z.string().optional(),
      isActive: z.coerce.boolean().optional(),
      includeDeleted: z.coerce.boolean().optional(),
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      sortBy: z.enum(["title", "slug", "createdAt", "updatedAt"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        items: z.array(AdminPageSchema),
        pagination: PagePaginationSchema,
      }),
    }),
  },

  GetPageById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("id must be a string")
        .min(1, { message: "id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminPageSchema,
    }),
  },

  CreatePage: {
    body: z.object({
      title: z
        .string("title must be a string")
        .trim()
        .min(1, { message: "Page title is required" })
        .max(200),
      slug: z
        .string("slug must be a string")
        .trim()
        .min(1, { message: "Page slug is required" })
        .max(200)
        .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
      content: z
        .string("content must be a string")
        .min(1, { message: "Page content is required" }),
      metaTitle: z.string().trim().optional().nullable(),
      metaDescription: z.string().trim().optional().nullable(),
      isActive: z.coerce.boolean().optional().default(true),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminPageSchema,
    }),
  },

  UpdatePage: {
    body: z.object({
      title: z.string().trim().min(1).max(200).optional(),
      slug: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
        .optional(),
      content: z.string().min(1).optional(),
      metaTitle: z.string().trim().optional().nullable(),
      metaDescription: z.string().trim().optional().nullable(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({
      id: z
        .string("id must be a string")
        .min(1, { message: "id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminPageSchema,
    }),
  },

  DeletePage: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("id must be a string")
        .min(1, { message: "id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RestorePage: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("id must be a string")
        .min(1, { message: "id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminPageSchema,
    }),
  },
};
