import { z } from "zod";

export const ComboKitTypes = {
  GetComboKits: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce
        .number()
        .min(1, { message: "page must be >= 1" })
        .default(1),
      limit: z.coerce
        .number()
        .min(1, { message: "limit must be >= 1" })
        .max(100, { message: "limit must be <= 100" })
        .default(10),
      isActive: z.coerce.boolean().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        data: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            description: z.string().nullable(),
            audience: z.string().nullable(),
            price: z.number(),
            isActive: z.boolean(),
            isDeleted: z.boolean().optional(),
            createdAt: z.date(),
            updatedAt: z.date(),
            items: z.array(
              z.object({
                id: z.string(),
                productVariantId: z.string(),
                quantity: z.number(),
                productVariant: z
                  .object({
                    id: z.string(),
                    sku: z.string(),
                    price: z.number(),
                    stock: z.number(),
                  })
                  .optional(),
              }),
            ),
          }),
        ),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
          hasNext: z.boolean(),
          hasPrev: z.boolean(),
        }),
      }),
    }),
  },

  GetComboKitBySlug: {
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
      data: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        description: z.string().nullable(),
        audience: z.string().nullable(),
        price: z.number(),
        isActive: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
        items: z.array(
          z.object({
            id: z.string(),
            productVariantId: z.string(),
            quantity: z.number(),
            productVariant: z
              .object({
                id: z.string(),
                sku: z.string(),
                price: z.number(),
                stock: z.number(),
              })
              .optional(),
          }),
        ),
      }),
    }),
  },

  // Admin / manager types
  CreateComboKit: {
    body: z.object({
      name: z
        .string("Combo name must be a string")
        .min(1, { message: "Combo name is required" })
        .max(255, { message: "Combo name must be at most 255 characters" }),
      slug: z
        .string("slug must be a string")
        .min(1, { message: "slug must be at least 1 character" })
        .max(255, { message: "slug must be at most 255 characters" })
        .optional(),
      description: z.string("description must be a string").optional(),
      audience: z.string("audience must be a string").optional(),
      price: z.coerce.number().min(0, { message: "price must be >= 0" }),
      isActive: z.coerce.boolean().optional(),
      items: z
        .array(
          z.object({
            productVariantId: z
              .string("productVariantId must be a string")
              .min(1, { message: "productVariantId is required" }),
            quantity: z.coerce
              .number()
              .min(1, { message: "quantity must be at least 1" }),
          }),
        )
        .optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({ id: z.string() }),
    }),
  },

  UpdateComboKit: {
    body: z.object({
      name: z.string().min(1).max(255).optional(),
      slug: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      audience: z.string().optional(),
      price: z.coerce.number().min(0).optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  AddComboKitItem: {
    body: z.object({
      productVariantId: z
        .string("productVariantId must be a string")
        .min(1, { message: "productVariantId is required" }),
      quantity: z.coerce
        .number()
        .min(1, { message: "quantity must be at least 1" }),
    }),
    params: z.object({
      comboKitId: z
        .string("comboKitId must be a string")
        .min(1, { message: "comboKitId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RemoveComboKitItem: {
    body: z.object({}),
    params: z.object({ comboKitId: z.string(), itemId: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  SoftDeleteComboKit: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RestoreComboKit: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  HardDeleteComboKit: {
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

export type ComboKitTypes = typeof ComboKitTypes;
