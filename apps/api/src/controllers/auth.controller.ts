import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { AuthService } from "../services/auth.service.js";
import appConfig from "../lib/config.js";

export class AuthController {
  constructor(private auth: AuthService) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: appConfig.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: appConfig.ACCESS_TOKEN_EXPIRY,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: appConfig.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: appConfig.REFRESH_TOKEN_EXPIRY,
    });
  }

  private extractRefreshToken(req: Request): string | null {
    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        refreshToken = authHeader.substring(7);
      }
    }
    return refreshToken || null;
  }

  register = async (req: Request, res: Response) => {
    const { email, password, username } = req.body;

    await this.auth.register(
      email.toLowerCase().trim(),
      password.trim(),
      username.trim(),
    );

    ResponseHandler.success(
      res,
      {},
      "Verification email sent! Please verify your email to continue.",
    );
  };

  login = async (req: Request, res: Response) => {
    const user = req.body;
    if (!user) {
      return ResponseHandler.unauthorized(res, "User not authenticated");
    }

    const data = await this.auth.login(user);

    // Set cookies for access and refresh tokens
    this.setAuthCookies(res, data.accessToken, data.refreshToken);

    ResponseHandler.success(
      res,
      { accessToken: data.accessToken, user: data.user },
      "Login successful",
    );
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = this.extractRefreshToken(req);
    if (!refreshToken) {
      return ResponseHandler.unauthorized(res, "No refresh token provided");
    }

    const tokens = await this.auth.refresh(refreshToken);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    ResponseHandler.success(
      res,
      { accessToken: tokens.accessToken },
      "Token refresh successful",
    );
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = this.extractRefreshToken(req);

    if (refreshToken) {
      await this.auth.logout(refreshToken);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    ResponseHandler.success(res, {}, "Logout successful");
  };

  me = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const user = await this.auth.me(userId);
    return ResponseHandler.success(res, user, "User fetched successfully");
  };

  verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.body;

    const tokens = await this.auth.verifyEmail(token);

    if (!tokens) {
      return ResponseHandler.unauthorized(
        res,
        "Invalid or expired verification token",
      );
    }

    // Set cookies for access and refresh tokens
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    ResponseHandler.success(
      res,
      { accessToken: tokens.accessToken },
      "Email verified successfully",
    );
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    await this.auth.forgotPassword(email.toLowerCase().trim());

    ResponseHandler.success(res, {}, "Forgot mail sent successfully");
  };

  verifyPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    await this.auth.verifyPassword(token, newPassword);

    ResponseHandler.success(res, {}, "Password reset successfully");
  };

  googleOauth = async (req: Request, res: Response) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${appConfig.CLIENT_ID_WEB}&redirect_uri=${appConfig.REDIRECT_URI}&response_type=code&scope=profile%20email`;

    ResponseHandler.success(res, { url }, "Google OAuth URL fetched");
  };

  googleOauthMobile = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    const data = await this.auth.googleOauthMobile(idToken);

    this.setAuthCookies(res, data.accessToken, data.refreshToken);

    ResponseHandler.success(
      res,
      { accessToken: data.accessToken, user: data.user },
      "Google OAuth mobile login successful",
    );
  };

  googleOauthCallback = async (req: Request, res: Response) => {
    const { code } = req.query;

    const data = await this.auth.googleOauthCallback(code as string);

    this.setAuthCookies(res, data.accessToken, data.refreshToken);

    ResponseHandler.success(
      res,
      { accessToken: data.accessToken, user: data.user },
      "Google OAuth callback handled",
    );
  };
}
