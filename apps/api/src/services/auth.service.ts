import { AuthProviderType, PrismaClient } from "../generated/prisma/client.js";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { normalizeEmail } from "../lib/email.js";
import { SessionRespository } from "../repositories/session.repository.js";
import argon2 from "argon2";
import logger from "../lib/logger.js";
import { UserRoles } from "@repo/types";
import { UserRespository } from "../repositories/user.repository.js";
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from "../lib/error.js";
import { Passwordhasher } from "../lib/password.js";
import { MailService } from "./mail.service.js";
import { MagicLinkService } from "./magicLink.service.js";
import { delayGenerator } from "../lib/sercurity.js";
import axios from "axios";
import { AuthMethod } from "../generated/prisma/client.js";
import { AuthProviderRepository } from "../repositories/authProvider.repository.js";
import { OAuth2Client } from "google-auth-library";

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwt: JWTService,
    private sessions: SessionRespository,
    private user: UserRespository,
    private magicLink: MagicLinkService,
    private authProvider: AuthProviderRepository,
  ) {}

  async generateTokens(
    userId: string,
    role: UserRoles,
    authMethod: AuthMethod = AuthMethod.PASSWORD,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await this.sessions.create({
      userId,
      refreshHash: "",
      expiresAt: new Date(Date.now() + appConfig.REFRESH_TOKEN_EXPIRY),
      authMethod,
    });

    const refreshToken = this.jwt.generateRefreshToken({
      sub: userId,
      sessionId: session.id,
    });

    await this.sessions.update(session.id, {
      refreshHash: await argon2.hash(refreshToken),
    });

    return {
      refreshToken,
      accessToken: this.jwt.generateAccessToken({ sub: userId, role }),
    };
  }

  async register(
    email: string,
    password: string,
    username: string,
  ): Promise<void> {
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await this.user.getUserByEmailOrUsername(
      normalizedEmail,
      username,
    );

    if (existingUser) {
      const delay = 500 + Math.random() * 500; // Mitigate user enumeration

      // If user has OAuth providers, prevent password registration
      if (existingUser.authProviders && existingUser.authProviders.length > 0) {
        logger.warn(
          { email },
          `Attempt to register with existing OAuth account for email: ${email}`,
        );
        delayGenerator(delay);
        throw new UnauthorizedError(
          "An account with this email already exists. Please log in using Google.",
        );
      }

      // Existing password-only user
      if (existingUser.username === username) {
        logger.warn(
          { username },
          `Attempt to register with existing username: ${username}`,
        );
        delayGenerator(delay);
        throw new UnauthorizedError("Username already in use");
      } else if (existingUser.email === normalizedEmail) {
        logger.warn(
          { email: normalizedEmail },
          `Attempt to register with existing email: ${normalizedEmail}`,
        );
        delayGenerator(delay);
        // Never reveal that the email is already registered
        return;
      }
    }

    const passwordHash = await Passwordhasher.hashPassword(password);

    const newUser = await this.user.create(email, passwordHash, username);

    if (!newUser) {
      logger.error("Error creating new user");
      throw new InternalServerError();
    }

    const verificationLink = await this.magicLink.createEmailVerificationLink(
      newUser.id,
    );

    MailService.sendVerificationEmail({
      name: newUser.username,
      to: newUser.email,
      verificationLink,
    }).catch((err) => {
      logger.error({ err }, "Failed to send welcome email:");
    });

    return;
  }

  async login(user: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      username: string;
      name: string | null;
      role: UserRoles;
    };
  }> {
    const userEmail = normalizeEmail(user.email);
    const dbUser = await this.user.getUserByEmail(userEmail);

    if (!dbUser) {
      // Never reveal that the email is not registered
      delayGenerator(500 + Math.random() * 500);
      throw new UnauthorizedError("Email or password incorrect");
    }

    if (dbUser.isEmailVerified === false) {
      logger.warn(
        { userId: dbUser.id },
        `Unverified email login attempt for user ID: ${dbUser.id}`,
      );
      throw new UnauthorizedError("Email not verified");
    }

    if (!dbUser.hashPassword) {
      // User registered via OAuth, no password set, cannot login with password
      delayGenerator(500 + Math.random() * 500);
      throw new UnauthorizedError("Email or password incorrect");
    }

    if (
      !(await Passwordhasher.verifyPassword(user.password, dbUser.hashPassword))
    )
      throw new UnauthorizedError();

    const { refreshToken, accessToken } = await this.generateTokens(
      dbUser.id,
      dbUser.role as UserRoles,
      AuthMethod.PASSWORD,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        name: dbUser.name,
        role: dbUser.role,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = this.jwt.verifyRefreshToken(refreshToken);
    if (!payload || !payload.sessionId || !payload.sub) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: payload.sessionId },
      });

      if (session && session.expiresAt < new Date()) {
        await tx.session.delete({
          where: { id: session.id },
        });
        throw new UnauthorizedError("Refresh token expired");
      }

      if (!session || session.isRevoked) {
        await tx.session.updateMany({
          where: { userId: payload?.sub },
          data: { isRevoked: true },
        });
        logger.warn(
          { userId: payload?.sub },
          `Refresh token reuse detected for user ${payload?.sub}`,
        );
        throw new UnauthorizedError("Token reuse detected");
      }

      if (!(await argon2.verify(session.refreshHash, refreshToken))) {
        await tx.session.updateMany({
          where: { userId: payload!.sub },
          data: { isRevoked: true },
        });

        logger.warn(
          { userId: payload!.sub },
          `Refresh token hash mismatch for user ${payload!.sub}`,
        );
        throw new UnauthorizedError("Invalid refresh token");
      }

      const newSession = await tx.session.create({
        data: {
          userId: payload!.sub,
          refreshHash: "",
          expiresAt: new Date(Date.now() + appConfig.REFRESH_TOKEN_EXPIRY),
          authMethod: session.authMethod,
        },
      });

      const newRefreshToken = this.jwt.generateRefreshToken({
        sub: payload!.sub,
        sessionId: newSession.id,
      });

      await tx.session.update({
        where: { id: newSession.id },
        data: { refreshHash: await argon2.hash(newRefreshToken) },
      });

      // NOTE: Need to shift this to a background job if scaling issues arise
      await tx.session.deleteMany({
        where: { OR: [{ id: session.id }, { expiresAt: { lt: new Date() } }] },
      });

      const user = await tx.user.findUnique({
        where: { id: payload!.sub },
      });

      return {
        accessToken: this.jwt.generateAccessToken({
          sub: payload!.sub,
          role: user!.role as UserRoles,
        }),
        refreshToken: newRefreshToken,
      };
    });
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwt.verifyRefreshToken(refreshToken);
      if (payload?.sessionId) {
        await this.sessions.delete(payload.sessionId);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Ignore errors during logout to ensure session cleanup
    }
  }

  async me(userId: string | undefined) {
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const user = await this.user.getUserById(userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async verifyEmail(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const dbUserId = await this.magicLink.validateEmailVerificationLink(token);
    if (!dbUserId) {
      throw new UnauthorizedError("Invalid or expired verification token");
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const data = await tx.user.update({
        where: { id: dbUserId },
        data: { isEmailVerified: true },
      });

      await tx.session.updateMany({
        where: { userId: dbUserId, isRevoked: false },
        data: { isRevoked: true },
      });

      return data;
    });

    return await this.generateTokens(
      dbUserId,
      user.role as UserRoles,
      AuthMethod.PASSWORD,
    );
  }

  async forgotPassword(email: string): Promise<void> {
    const normalized = normalizeEmail(email);
    const dbUser = await this.user.getUserByEmail(normalized);

    if (!dbUser) {
      // Never reveal that the email is not registered
      delayGenerator(500 + Math.random() * 500);
      return;
    }

    // If user is OAuth-only (no password), skip password reset
    if (!dbUser.hashPassword) {
      logger.info(
        { userId: dbUser.id },
        `Password reset attempted for OAuth-only user: ${dbUser.id}`,
      );
      delayGenerator(500 + Math.random() * 500);
      return; // Silently ignore, as they can't reset a non-existent password
    }

    const resetLink = await this.magicLink.createPasswordResetLink(dbUser.id);

    MailService.sendPasswordResetEmail(
      dbUser.email,
      dbUser.username,
      resetLink,
    ).catch((error) => {
      logger.warn({ err: error }, "Failed to send welcome email:");
    });

    return;
  }

  async verifyPassword(token: string, newPassword: string): Promise<void> {
    const dbUserId = await this.magicLink.validatePasswordResetLink(token);

    if (!dbUserId) {
      throw new UnauthorizedError("Invalid or expired password reset token.");
    }

    const newHashedPassword = await Passwordhasher.hashPassword(newPassword);

    await this.user.updateUserPassword(dbUserId, newHashedPassword);

    return;
  }

  async googleOauthCallback(
    code: string,
    platform: string = "WEB",
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      username: string;
      name: string | null;
      role: UserRoles;
      createdAt: Date;
      updatedAt: Date;
    };
  }> {
    if (!code) {
      throw new UnauthorizedError("No authorization code provided");
    }

    let res;
    const normalizedPlatform = platform.toUpperCase();
    const redirectUri =
      normalizedPlatform === "MOBILE"
        ? appConfig.REDIRECT_URI_BACKEND
        : appConfig.REDIRECT_URI_WEB;

    try {
      res = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          client_id: appConfig.CLIENT_ID_WEB,
          client_secret: appConfig.CLIENT_SECRET,
          code: decodeURIComponent(code),
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
    } catch (error) {
      logger.error({ err: error }, "Error fetching Google OAuth token:");
      throw new UnauthorizedError("Failed to authenticate with Google");
    }

    const { id_token } = res.data;
    const client = new OAuth2Client(appConfig.CLIENT_ID_WEB);

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: appConfig.CLIENT_ID_WEB,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      throw new UnauthorizedError("Invalid ID token received from Google");
    }

    if (!payload.email_verified) {
      throw new UnauthorizedError("Google email is not verified");
    }

    const providerId = payload.sub;
    const email = normalizeEmail(payload.email ?? "");
    if (!email) {
      logger.warn("Google ID token missing email");
      throw new UnauthorizedError("Google account does not provide an email");
    }
    const name = payload.name ?? null;

    const existingProvider = await this.authProvider.getExistingProvider(
      AuthProviderType.GOOGLE,
      providerId,
    );

    // If user with this OAuth provider already exists, log them in
    if (existingProvider) {
      const { refreshToken, accessToken } = await this.generateTokens(
        existingProvider.user.id,
        existingProvider.user.role as UserRoles,
        AuthMethod.OAUTH,
      );

      return {
        accessToken,
        refreshToken,
        user: {
          id: existingProvider.user.id,
          email: existingProvider.user.email,
          username: existingProvider.user.username,
          name: existingProvider.user.name,
          role: existingProvider.user.role,
          createdAt: existingProvider.user.createdAt,
          updatedAt: existingProvider.user.updatedAt,
        },
      };
    }

    // If user doesn't exists. Check if email already exists
    const existingUser = await this.user.getUserByEmail(email);

    if (existingUser) {
      // Link Google provider to existing user

      await this.prisma.$transaction(async (tx) => {
        await tx.authProvider.create({
          data: {
            provider: AuthProviderType.GOOGLE,
            providerId,
            userId: existingUser.id,
          },
        });

        await tx.user.update({
          where: { id: existingUser.id },
          data: { name: name, isEmailVerified: true },
        });
      });

      const { refreshToken, accessToken } = await this.generateTokens(
        existingUser.id,
        existingUser.role as UserRoles,
        AuthMethod.OAUTH,
      );

      return {
        accessToken,
        refreshToken,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          name: existingUser.name,
          role: existingUser.role,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
      };
    }

    // No user or provider exists, create new user

    const usernameBase = email.includes("@") ? email.split("@")[0] : email;
    const username = usernameBase || `user_${Date.now()}`; // Fallback

    const existingUsername = await this.user.getUserByUsername(username);
    const finalUsername = existingUsername
      ? `${username}_${Date.now()}`
      : username;

    const newUser = await this.user.createOauthUser(
      email,
      finalUsername,
      AuthProviderType.GOOGLE,
      providerId,
      name,
    );

    const { refreshToken, accessToken } = await this.generateTokens(
      newUser.id,
      newUser.role as UserRoles,
      AuthMethod.OAUTH,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    };
  }

  async usernameAvailablity(username: string): Promise<boolean> {
    const user = await this.user.getUserByUsername(username);

    if (user) {
      logger.warn({ username }, "Username already exists.");
      throw new BadRequestError("Username is not available.");
    }

    return true;
  }
}
