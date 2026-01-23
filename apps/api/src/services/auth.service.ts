import { PrismaClient } from "../generated/prisma/client.js";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { SessionRespository } from "../repositories/session.repository.js";
import argon2 from "argon2";
import loggerInstance from "../lib/logger.js";
import { UserRoles } from "@repo/types";
import { UserRespository } from "../repositories/user.repository.js";
import {
  ConflictError,
  InternalServerError,
  UnauthorizedError,
} from "../lib/error.js";
import { Passwordhasher } from "../lib/password.js";
import { MailService } from "./mail.service.js";

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwt: JWTService,
    private sessions: SessionRespository,
    private user: UserRespository,
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
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const existingUser = await this.user.getUserByEmailOrUsername(
      email,
      username,
    );

    // TODO: Need to send verification email instead of throwing error
    if (existingUser) throw new ConflictError("Email already in use");

    const passwordHash = await Passwordhasher.hashPassword(password);

    const newUser = await this.user.create(email, passwordHash, username);

    if (!newUser) {
      loggerInstance.error("Error creating new user");
      throw new InternalServerError();
    }

    MailService.sendWelcomeEmail(newUser.email, newUser.username).catch(
      (err) => {
        loggerInstance.error("Failed to send welcome email:", err);
      },
    );

    const { refreshToken, accessToken } = await this.generateTokens(
      newUser.id,
      newUser.role as UserRoles,
    );
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async login(user: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const dbUser = await this.user.getUserByEmail(user.email);

    if (!dbUser) {
      throw new UnauthorizedError();
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

  async logout(sessionId: string): Promise<void> {
    await this.sessions.delete(sessionId);
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
}
