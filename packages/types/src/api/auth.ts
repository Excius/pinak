import { z } from "zod";
import { UserSchema } from "../user.js";

export const AuthTypes = {
  RegisterUser: {
    body: z.object({
      email: z
        .string("Email must be a string")
        .min(1, { message: "Email is required" })
        .email({ message: "Invalid email format" }),
      password: z
        .string("Password must be a string")
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(64, { message: "Password must be at most 64 characters long" }),
      username: z
        .string("Username must be a string")
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(30, { message: "Username must be at most 30 characters long" })
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
          message:
            "Username must start with a letter and contain only letters, numbers, and underscores",
        }),
    }),
    params: z.object({
      // no path params for register by default; add here if needed
    }),
    query: z.object({
      // age: z.coerce.number().min(13, "Must be at least 13 years old"),
      // optional query example
      redirect: z.string("redirect must be a string").optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}).nullable(),
    }),
  },

  LoginUser: {
    body: z.object({
      email: z
        .string("Email must be a string")
        .min(1, { message: "Email is required" })
        .email({ message: "Invalid email format" }),
      password: z
        .string("Password must be a string")
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(64, { message: "Password must be at most 64 characters long" }),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        accessToken: z.string(),
        user: UserSchema,
      }),
    }),
  },

  username: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      username: z
        .string("Username must be a string")
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(30, { message: "Username must be at most 30 characters long" })
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
          message:
            "Username must start with a letter and contain only letters, numbers, and underscores",
        }),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        username: z.string(),
      }),
    }),
  },

  RefreshToken: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string("message must be a string"),
      success: z.boolean("success must be a boolean"),
      data: z.object({
        accessToken: z.string("accessToken must be a string"),
      }),
    }),
  },

  LogoutUser: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}).nullable(),
    }),
  },

  Me: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string("message must be a string"),
      success: z.boolean("success must be a boolean"),
      data: UserSchema,
    }),
  },

  VerifyEmail: {
    body: z.object({
      token: z.string().min(1, "Token is required"),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      success: z.boolean("success must be a boolean"),
      message: z.string("message must be a string"),
      data: z.object({
        accessToken: z.string("accessToken must be a string"),
      }),
    }),
  },

  ForgotPassword: {
    body: z.object({
      email: z.email("Invalid email format"),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}).nullable(),
    }),
  },

  VerifyPassword: {
    body: z.object({
      token: z.string().min(1, "Token is required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long"),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}).nullable(),
    }),
  },

  GoogleOauth: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      platform: z
        .enum(["WEB", "MOBILE"], "platform must be either WEB or MOBILE")
        .optional(),
    }),
    response: z.object({
      message: z.string("message must be a string"),
      success: z.boolean("success must be a boolean"),
      data: z.object({
        url: z.string("url must be a string"),
      }),
    }),
  },

  GoogleOauthMobile: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      code: z
        .string("Code must be a string")
        .min(1, { message: "Code is required" }),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}).nullable(),
    }),
  },

  GoogleOauthCallback: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      code: z
        .string("Code must be a string")
        .min(1, { message: "Code is required" }),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        accessToken: z.string(),
        user: UserSchema,
      }),
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof AuthTypes]: z.infer<(typeof AuthTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof AuthTypes]: z.infer<(typeof AuthTypes)[K]["params"]>;
};

export type QueryTypes = {
  [K in keyof typeof AuthTypes]: z.infer<(typeof AuthTypes)[K]["query"]>;
};

export type ResponseTypes = {
  [K in keyof typeof AuthTypes]: z.infer<(typeof AuthTypes)[K]["response"]>;
};

// Legacy individual exports for backward compatibility
export type RegisterUserBody = BodyTypes["RegisterUser"];
export type RegisterUserParams = ParamsTypes["RegisterUser"];
export type RegisterUserQuery = QueryTypes["RegisterUser"];
export type LoginUserBody = BodyTypes["LoginUser"];
export type LoginUserParams = ParamsTypes["LoginUser"];
export type LoginUserQuery = QueryTypes["LoginUser"];
export type RefreshTokenBody = BodyTypes["RefreshToken"];
export type RefreshTokenParams = ParamsTypes["RefreshToken"];
export type RefreshTokenQuery = QueryTypes["RefreshToken"];
export type LogoutUserBody = BodyTypes["LogoutUser"];
export type LogoutUserParams = ParamsTypes["LogoutUser"];
export type LogoutUserQuery = QueryTypes["LogoutUser"];
export type MeBody = BodyTypes["Me"];
export type MeParams = ParamsTypes["Me"];
export type MeQuery = QueryTypes["Me"];
export type RegisterUserResponse = ResponseTypes["RegisterUser"];
export type LoginUserResponse = ResponseTypes["LoginUser"];
export type RefreshTokenResponse = ResponseTypes["RefreshToken"];
export type LogoutUserResponse = ResponseTypes["LogoutUser"];
export type MeResponse = ResponseTypes["Me"];
export type VerifyEmailBody = BodyTypes["VerifyEmail"];
export type VerifyEmailParams = ParamsTypes["VerifyEmail"];
export type VerifyEmailQuery = QueryTypes["VerifyEmail"];
export type VerifyEmailResponse = ResponseTypes["VerifyEmail"];
export type ForgotPasswordBody = BodyTypes["ForgotPassword"];
export type ForgotPasswordParams = ParamsTypes["ForgotPassword"];
export type ForgotPasswordQuery = QueryTypes["ForgotPassword"];
export type ForgotPasswordResponse = ResponseTypes["ForgotPassword"];
export type VerifyPasswordBody = BodyTypes["VerifyPassword"];
export type VerifyPasswordParams = ParamsTypes["VerifyPassword"];
export type VerifyPasswordQuery = QueryTypes["VerifyPassword"];
export type VerifyPasswordResponse = ResponseTypes["VerifyPassword"];

/**
 * Example use case:
 * import type { BodyTypes, ResponseTypes } from '@repo/types';
 *
 * type LoginBody = BodyTypes['LoginUser'];
 * type LoginResponse = ResponseTypes['LoginUser'];
 */
