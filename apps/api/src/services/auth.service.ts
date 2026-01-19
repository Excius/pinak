import { PrismaClient } from "../generated/prisma/client.js";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { SessionRespository } from "../repositories/session.repository.js";
import argon2 from "argon2";
import loggerInstance from "../lib/logger.js";
import { UserRoles } from "@repo/types";

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwt: JWTService,
    private sessions: SessionRespository,
  ) {}

  async login(user: { id: string; role: UserRoles }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const session = await this.sessions.create({
      userId: user.id,
      refreshHash: "",
      expiresAt: new Date(Date.now() + appConfig.REFRESH_TOKEN_EXPIRY),
    });

    const refreshToken = this.jwt.generateRefreshToken({
      sub: user.id,
      sessionId: session.id,
    });

    await this.sessions.update(session.id, {
      refreshHash: await argon2.hash(refreshToken),
    });

    return {
      accessToken: this.jwt.generateAccessToken({
        sub: user.id,
        role: user.role,
      }),
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

      if (!session || session.isRevoked) {
        await tx.session.updateMany({
          where: { userId: payload?.sub },
          data: { isRevoked: true },
        });
        loggerInstance.warn(
          `Refresh token reuse detected for user ${payload?.sub}`,
        );
        throw new Error("Token reuse detected");
      }

      if (!(await argon2.verify(session.refreshHash, refreshToken))) {
        await tx.session.updateMany({
          where: { userId: payload!.sub },
          data: { isRevoked: true },
        });

        loggerInstance.warn(
          `Refresh token hash mismatch for user ${payload!.sub}`,
        );
        throw new Error("Invalid refresh token");
      }

      await tx.session.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });

      const newSession = await tx.session.create({
        data: {
          userId: payload!.sub,
          refreshHash: "",
          expiresAt: new Date(Date.now() + appConfig.REFRESH_TOKEN_EXPIRY),
          rotatedFrom: session.id,
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

      const user = await tx.user.findUnique({
        where: { id: payload!.sub },
      });

      return {
        accessToken: this.jwt.generateAccessToken({
          sub: payload!.sub,
          role: (user!.role as string).toLowerCase() as UserRoles,
        }),
        refreshToken: newRefreshToken,
      };
    });
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessions.revoke(sessionId);
  }
}
