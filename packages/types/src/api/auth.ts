import { z } from "zod";
import { UserSchema } from "../user.js";

export const AuthTypes = {
  RegisterUser: {
    body: z.object({
      email: z.email("Invalid email format"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long"),
      username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(30, "Username must be at most 30 characters long")
        .regex(
          /^[a-zA-Z][a-zA-Z0-9_]*$/,
          "Username must start with a letter and contain only letters, numbers, and underscores",
        ),
      platform: z.literal("web").or(z.literal("mobile")),
    }),
    params: z.object({
      // no path params for register by default; add here if needed
    }),
    query: z.object({
      // age: z.coerce.number().min(13, "Must be at least 13 years old"),
      // optional query example
      redirect: z.string().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}).nullable(),
    }),
  },

  LoginUser: {
    body: z.object({
      email: z.email("Invalid email format"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long"),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        accessToken: z.string(),
      }),
    }),
  },

  RefreshToken: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        accessToken: z.string(),
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
      message: z.string(),
      success: z.boolean(),
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
      success: z.boolean(),
      message: z.string(),
      data: z.object({
        accessToken: z.string(),
      }),
    }),
  },
};

export type RegisterUserBody = z.infer<typeof AuthTypes.RegisterUser.body>;
export type RegisterUserParams = z.infer<typeof AuthTypes.RegisterUser.params>;
export type RegisterUserQuery = z.infer<typeof AuthTypes.RegisterUser.query>;
export type LoginUserBody = z.infer<typeof AuthTypes.LoginUser.body>;
export type LoginUserParams = z.infer<typeof AuthTypes.LoginUser.params>;
export type LoginUserQuery = z.infer<typeof AuthTypes.LoginUser.query>;
export type RefreshTokenBody = z.infer<typeof AuthTypes.RefreshToken.body>;
export type RefreshTokenParams = z.infer<typeof AuthTypes.RefreshToken.params>;
export type RefreshTokenQuery = z.infer<typeof AuthTypes.RefreshToken.query>;
export type LogoutUserBody = z.infer<typeof AuthTypes.LogoutUser.body>;
export type LogoutUserParams = z.infer<typeof AuthTypes.LogoutUser.params>;
export type LogoutUserQuery = z.infer<typeof AuthTypes.LogoutUser.query>;
export type MeBody = z.infer<typeof AuthTypes.Me.body>;
export type MeParams = z.infer<typeof AuthTypes.Me.params>;
export type MeQuery = z.infer<typeof AuthTypes.Me.query>;
export type RegisterUserResponse = z.infer<
  typeof AuthTypes.RegisterUser.response
>;
export type LoginUserResponse = z.infer<typeof AuthTypes.LoginUser.response>;
export type RefreshTokenResponse = z.infer<
  typeof AuthTypes.RefreshToken.response
>;
export type LogoutUserResponse = z.infer<typeof AuthTypes.LogoutUser.response>;
export type MeResponse = z.infer<typeof AuthTypes.Me.response>;
export type VerifyEmailBody = z.infer<typeof AuthTypes.VerifyEmail.body>;
export type VerifyEmailParams = z.infer<typeof AuthTypes.VerifyEmail.params>;
export type VerifyEmailQuery = z.infer<typeof AuthTypes.VerifyEmail.query>;
export type VerifyEmailResponse = z.infer<
  typeof AuthTypes.VerifyEmail.response
>;
