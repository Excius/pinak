import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { AuthService } from "../services/auth.service.js";
import appConfig from "../lib/config.js";

export class AuthController {
  constructor(private auth: AuthService) {}

  register = async (req: Request, res: Response) => {
    const { email, password, username } = req.body;

    const tokens = await this.auth.register(email, password, username);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: appConfig.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: appConfig.ACCESS_TOKEN_EXPIRY,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: appConfig.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: appConfig.REFRESH_TOKEN_EXPIRY,
    });

    ResponseHandler.success(res, {}, "Registration successful");
  };

  login = async (req: Request, res: Response) => {
    const user = req.body;
    if (!user) {
      return ResponseHandler.unauthorized(res, "User not authenticated");
    }

    const tokens = await this.auth.login(user);

    // Set cookies for access and refresh tokens
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: appConfig.NODE_ENV === "production", // Use secure in production
      sameSite: "strict",
      maxAge: appConfig.ACCESS_TOKEN_EXPIRY,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: appConfig.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: appConfig.REFRESH_TOKEN_EXPIRY,
    });

    ResponseHandler.success(res, {}, "Login successful");
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const tokens = await this.auth.refresh(refreshToken);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: appConfig.ACCESS_TOKEN_EXPIRY,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: appConfig.REFRESH_TOKEN_EXPIRY,
    });

    ResponseHandler.success(res, {}, "Token refresh successful");
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    ResponseHandler.success(res, {}, "Logout successful");
  };

  me = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const user = await this.auth.me(userId);
    return ResponseHandler.success(res, user, "User fetched successfully");
  };
}
