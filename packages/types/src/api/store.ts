import { z } from "zod";

export const PublicStoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  phone: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
  isActive: z.boolean(),
  distance: z.number().nullable().optional(), // Distance in kilometers if geo-searched
});

export const AdminStoreSchema = PublicStoreSchema.extend({
  isDeleted: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const StoreLocationsSchema = z.object({
  cities: z.array(z.string()),
  states: z.array(z.string()),
});

export const StoreTypes = {
  ListStores: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      search: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      latitude: z.coerce.number().min(-90, "Latitude must be >= -90").max(90, "Latitude must be <= 90").optional(),
      longitude: z.coerce.number().min(-180, "Longitude must be >= -180").max(180, "Longitude must be <= 180").optional(),
      radius: z.coerce.number().positive("Radius must be positive").optional(),
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      sortBy: z.enum(["name", "city", "state", "distance", "createdAt"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        items: z.array(PublicStoreSchema),
        pagination: PaginationSchema,
      }),
    }),
  },

  GetStoreById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("store id must be a string")
        .min(1, { message: "store id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicStoreSchema,
    }),
  },

  GetStoreLocations: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: StoreLocationsSchema,
    }),
  },
};

export const StoreAdminTypes = {
  ListStores: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      search: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      isActive: z.coerce.boolean().optional(),
      includeDeleted: z.coerce.boolean().optional(),
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      sortBy: z.enum(["name", "city", "state", "createdAt", "updatedAt"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        items: z.array(AdminStoreSchema),
        pagination: PaginationSchema,
      }),
    }),
  },

  GetStoreById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("store id must be a string")
        .min(1, { message: "store id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminStoreSchema,
    }),
  },

  CreateStore: {
    body: z.object({
      name: z.string().trim().min(1, { message: "Store name is required" }).max(200),
      address: z.string().trim().min(1, { message: "Address is required" }),
      city: z.string().trim().min(1, { message: "City is required" }),
      state: z.string().trim().min(1, { message: "State is required" }),
      zipCode: z.string().trim().min(1, { message: "Zip code is required" }),
      phone: z.string().trim().optional().nullable(),
      latitude: z.coerce.number().min(-90, "Latitude must be >= -90").max(90, "Latitude must be <= 90"),
      longitude: z.coerce.number().min(-180, "Longitude must be >= -180").max(180, "Longitude must be <= 180"),
      isActive: z.coerce.boolean().optional().default(true),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminStoreSchema,
    }),
  },

  UpdateStore: {
    body: z.object({
      name: z.string().trim().min(1).max(200).optional(),
      address: z.string().trim().min(1).optional(),
      city: z.string().trim().min(1).optional(),
      state: z.string().trim().min(1).optional(),
      zipCode: z.string().trim().min(1).optional(),
      phone: z.string().trim().optional().nullable(),
      latitude: z.coerce.number().min(-90, "Latitude must be >= -90").max(90, "Latitude must be <= 90").optional(),
      longitude: z.coerce.number().min(-180, "Longitude must be >= -180").max(180, "Longitude must be <= 180").optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({
      id: z
        .string("store id must be a string")
        .min(1, { message: "store id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminStoreSchema,
    }),
  },

  DeleteStore: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("store id must be a string")
        .min(1, { message: "store id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RestoreStore: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("store id must be a string")
        .min(1, { message: "store id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminStoreSchema,
    }),
  },
};
