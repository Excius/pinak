import { z } from "zod";
import { UserSchema } from "../user.js";

export const AuthTypes = {
  RegisterUser: {
    body: z.object({
      email: z.email("Invalid email format"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
      username: z
        .string()
        .min(3, "Username must be at least 3 characters long"),
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
      accessToken: z.string(),
    }),
  },

  LoginUser: {
    body: z.object({
      email: z.email("Invalid email format"),
      password: z.string(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      accessToken: z.string(),
    }),
  },

  RefreshToken: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      accessToken: z.string(),
    }),
  },

  LogoutUser: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({}),
  },

  Me: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: UserSchema,
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
