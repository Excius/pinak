import { z } from "zod";

const FeaturedSectionTypeSchema = z.enum(
  ["EXPERT_PICKS", "HOMEPAGE_HERO", "DEALS"],
  {
    message: "type must be EXPERT_PICKS, HOMEPAGE_HERO, or DEALS",
  },
);

const PublicFeaturedSectionImageSchema = z.object({
  id: z.string(),
  featuredSectionId: z.string(),
  url: z.string(),
  altText: z.string().nullable().optional(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

export const AdminFeaturedSectionImageSchema = PublicFeaturedSectionImageSchema.extend({
  isDeleted: z.boolean(),
});

const PublicFeaturedSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: FeaturedSectionTypeSchema,
  priority: z.number().int(),
  images: z.array(PublicFeaturedSectionImageSchema).default([]),
});

const AdminFeaturedSectionSchema = PublicFeaturedSectionSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
  productCount: z.number().int(),
});

export const FeaturedSectionTypes = {
  ListFeaturedSections: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(PublicFeaturedSectionSchema),
    }),
  },

  GetFeaturedSectionById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("section id must be a string")
        .min(1, { message: "section id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicFeaturedSectionSchema,
    }),
  },

  AdminListFeaturedSections: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminFeaturedSectionSchema),
    }),
  },

  AdminGetFeaturedSectionById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("section id must be a string")
        .min(1, { message: "section id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminFeaturedSectionSchema,
    }),
  },

  CreateFeaturedSection: {
    body: z.object({
      title: z
        .string("title must be a string")
        .min(1, { message: "title is required" })
        .max(255, { message: "title must be at most 255 characters" }),
      type: FeaturedSectionTypeSchema,
      priority: z.coerce.number().int().min(0).optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminFeaturedSectionSchema,
    }),
  },

  UpdateFeaturedSection: {
    body: z.object({
      title: z.string().min(1).max(255).optional(),
      type: FeaturedSectionTypeSchema.optional(),
      priority: z.coerce.number().int().min(0).optional(),
    }),
    params: z.object({
      id: z.string().min(1, { message: "section id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminFeaturedSectionSchema,
    }),
  },

  DeleteFeaturedSection: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "section id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RestoreFeaturedSection: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "section id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminFeaturedSectionSchema,
    }),
  },

  HardDeleteFeaturedSection: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "section id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },
};

export const FeaturedSectionAdminTypes = {
  AdminGetFeaturedSectionImages: {
    body: z.object({}),
    params: z.object({
      sectionId: z.string().min(1, { message: "section id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminFeaturedSectionImageSchema),
    }),
  },

  AddFeaturedSectionImage: {
    body: z.object({
      url: z.string().min(1).url(),
      altText: z.string().optional(),
      isPrimary: z.coerce.boolean().optional(),
    }),
    params: z.object({ sectionId: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicFeaturedSectionImageSchema,
    }),
  },

  SetPrimaryFeaturedSectionImage: {
    body: z.object({}),
    params: z.object({ imageId: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({ id: z.string(), isPrimary: z.boolean() }),
    }),
  },

  SoftDeleteFeaturedSectionImage: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RestoreFeaturedSectionImage: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  HardDeleteFeaturedSectionImage: {
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
  [K in keyof typeof FeaturedSectionTypes]: z.infer<
    (typeof FeaturedSectionTypes)[K]["body"]
  >;
};

export type ParamsTypes = {
  [K in keyof typeof FeaturedSectionTypes]: z.infer<
    (typeof FeaturedSectionTypes)[K]["params"]
  >;
};

export type QueryTypes = {
  [K in keyof typeof FeaturedSectionTypes]: z.infer<
    (typeof FeaturedSectionTypes)[K]["query"]
  >;
};

export type ResponseTypes = {
  [K in keyof typeof FeaturedSectionTypes]: z.infer<
    (typeof FeaturedSectionTypes)[K]["response"]
  >;
};
