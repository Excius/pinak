// User-related types
import { z } from "zod";

export type UserRoles = "ADMIN" | "MODERATOR" | "USER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRoles;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = z.object({
  id: z.string("id must be a string"),
  email: z
    .string("email must be a string")
    .email({ message: "Invalid email format" }),
  username: z.string("username must be a string"),
  name: z.string().nullable(),
  role: z.enum(
    ["ADMIN", "MODERATOR", "USER"],
    "role must be one of ADMIN, MODERATOR, USER",
  ),
});

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// export interface UserResponse extends User {
// API-specific fields can be added here if needed
// }

// export interface AuthResponse {
//   user: UserResponse;
//   token: string;
//   expiresIn: string;
// }

export interface UserFilters {
  email?: string;
  name?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}
