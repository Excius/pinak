import { z } from "zod";

const UserRoleSchema = z.enum(["ADMIN", "MODERATOR", "USER"]);
const UserStatusSchema = z.enum(["ACTIVE", "INACTIVE", "DELETED"]);

const AdminUserSummarySchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  name: z.string().nullable(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  isEmailVerified: z.boolean(),
  createdAt: z.date().or(z.string()),
  orderCount: z.number(),
  totalSpent: z.number(), // paise, completed payments only
});

const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const UserAdminTypes = {
  ListUsers: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      search: z.string().trim().max(100).optional(),
      role: UserRoleSchema.optional(),
      status: UserStatusSchema.optional(),
      sortBy: z.enum(["createdAt", "name", "email"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        items: z.array(AdminUserSummarySchema),
        pagination: PaginationSchema,
      }),
    }),
  },

  UpdateUserStatus: {
    // Deleting is a separate (DELETE) action; DELETED users are brought back with ACTIVE/INACTIVE here
    body: z.object({ status: z.enum(["ACTIVE", "INACTIVE"]) }),
    params: z.object({ id: z.string().min(1, { message: "id is required" }) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({ id: z.string(), status: UserStatusSchema }),
    }),
  },

  DeleteUser: {
    body: z.object({}),
    params: z.object({ id: z.string().min(1, { message: "id is required" }) }),
    query: z.object({}),
    response: z.object({ message: z.string(), success: z.boolean() }),
  },

  GetUser: {
    body: z.object({}),
    params: z.object({ id: z.string().min(1, { message: "id is required" }) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}).passthrough(),
    }),
  },
};
