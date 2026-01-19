import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { AuthService } from "../services/auth.service.js";
import appConfig from "../lib/config.js";

export class AuthController {
  constructor(private auth: AuthService) {}

  login = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      return ResponseHandler.unauthorized(res, "User not authenticated");
    }

    const tokens = await this.auth.login(user);

    // Set cookies for access and refresh tokens
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "strict",
      maxAge: appConfig.ACCESS_TOKEN_EXPIRY,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: appConfig.REFRESH_TOKEN_EXPIRY,
    });

    ResponseHandler.success(res, { user }, "Login successful");
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
}
