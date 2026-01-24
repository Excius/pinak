import { PrismaClient } from "../generated/prisma/client.js";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { SessionRespository } from "../repositories/session.repository.js";
import argon2 from "argon2";
import loggerInstance from "../lib/logger.js";
import { UserRoles } from "@repo/types";
import { UserRespository } from "../repositories/user.repository.js";
import { InternalServerError, UnauthorizedError } from "../lib/error.js";
import { Passwordhasher } from "../lib/password.js";
import { MailService } from "./mail.service.js";
import { MagicLinkService } from "./magicLink.service.js";

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwt: JWTService,
    private sessions: SessionRespository,
    private user: UserRespository,
    private magicLink: MagicLinkService,
  ) {}

  async generateTokens(
    userId: string,
    role: UserRoles,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await this.sessions.create({
      userId,
      refreshHash: "",
      expiresAt: new Date(Date.now() + appConfig.REFRESH_TOKEN_EXPIRY),
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
    platform: string,
  ): Promise<void> {
    const existingUser = await this.user.getUserByEmailOrUsername(
      email,
      username,
    );

    if (existingUser) {
      const delay = 1000 + Math.random() * 500; // Mitigate user enumeration
      if (existingUser.username === username) {
        loggerInstance.warn(
          `Attempt to register with existing username: ${username}`,
        );
        setTimeout(() => {}, delay);
        throw new UnauthorizedError("Username already in use");
      } else if (existingUser.email === email) {
        loggerInstance.warn(
          `Attempt to register with existing email: ${email}`,
        );
        setTimeout(() => {}, delay);
        return;
      }
    }

    const passwordHash = await Passwordhasher.hashPassword(password);

    const newUser = await this.user.create(email, passwordHash, username);

    if (!newUser) {
      loggerInstance.error("Error creating new user");
      throw new InternalServerError();
    }

    const verificationLink = await this.magicLink.createEmailVerificationLink(
      newUser.id,
      platform,
    );

    MailService.sendVerificationEmail({
      name: newUser.username,
      to: newUser.email,
      verificationLink,
    }).catch((err) => {
      loggerInstance.error("Failed to send welcome email:", err);
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
      createdAt: Date;
      updatedAt: Date;
    };
  }> {
    const userEmail = user.email.trim();
    const dbUser = await this.user.getUserByEmail(userEmail);

    if (!dbUser) {
      // Mitigate user enumeration with delay
      const delay = 1000 + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
      throw new UnauthorizedError("Email or password incorrect");
    }

    if (dbUser.isEmailVerified === false) {
      loggerInstance.warn(
        `Unverified email login attempt for user ID: ${dbUser.id}`,
      );
      throw new UnauthorizedError("Email not verified");
    }

    if (!dbUser.hashPassword) {
      // TODO: Need to manage the case of user without password (OAuth user)
      throw new UnauthorizedError();
    }

    if (
      !(await Passwordhasher.verifyPassword(user.password, dbUser.hashPassword))
    )
      throw new UnauthorizedError();

    const { refreshToken, accessToken } = await this.generateTokens(
      dbUser.id,
      dbUser.role as UserRoles,
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
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = this.jwt.verifyRefreshToken(refreshToken);

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: payload?.sessionId },
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
        loggerInstance.warn(
          `Refresh token reuse detected for user ${payload?.sub}`,
        );
        throw new UnauthorizedError("Token reuse detected");
      }

      if (!(await argon2.verify(session.refreshHash, refreshToken))) {
        await tx.session.updateMany({
          where: { userId: payload!.sub },
          data: { isRevoked: true },
        });

        loggerInstance.warn(
          `Refresh token hash mismatch for user ${payload!.sub}`,
        );
        throw new UnauthorizedError("Invalid refresh token");
      }

      const newSession = await tx.session.create({
        data: {
          userId: payload!.sub,
          refreshHash: "",
          expiresAt: new Date(Date.now() + appConfig.REFRESH_TOKEN_EXPIRY),
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

    const user = await this.prisma.user.update({
      where: { id: dbUserId },
      data: { isEmailVerified: true },
    });

    return await this.generateTokens(dbUserId, user.role as UserRoles);
  }

  async forgotPassword(email: string, platform: string): Promise<void> {
    const dbUser = await this.user.getUserByEmail(email);

    if (!dbUser) {
      setTimeout(() => {}, Math.random() * 500 + 1000);

      return;
    }

    const resetLink = await this.magicLink.createPasswordResetLink(
      dbUser.id,
      platform,
    );

    MailService.sendPasswordResetEmail(
      dbUser.email,
      dbUser.username,
      resetLink,
    ).catch((error) => {
      loggerInstance.warn("Failed to send welcome email:", error);
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
}
