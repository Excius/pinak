import { z } from "zod";

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
  },

  LoginUser: {
    body: z.object({
      email: z.email("Invalid email format"),
      password: z.string(),
    }),
    params: z.object({}),
    query: z.object({}),
  },

  RefreshToken: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
  },

  LogoutUser: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
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
