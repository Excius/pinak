import { MagicLinkRepository } from "../repositories/magicLink.repository.js";
import crypto from "crypto";
import argon from "argon2";
import appConfig from "../lib/config.js";
import { UnauthorizedError } from "../lib/error.js";

export class MagicLinkService {
  constructor(private readonly magicLinkRepository: MagicLinkRepository) {}

  async createPasswordResetLink(
    userId: string,
    platform: string,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString("base64url");

    await this.magicLinkRepository.createMagicLink({
      userId,
      tokenHash: await argon.hash(token),
      tokenType: "PASSWORD_RESET",
      expiresAt: new Date(
        Date.now() + appConfig.FORGOT_PASSWWORD_EXPIRY_MINUTES * 60 * 1000,
      ), // 15 minutes from now
    });

    return platform === "MOBILE"
      ? `${appConfig.MOBILE_APP_URL}/reset-password?token=${token}`
      : `${appConfig.FRONTEND_URL}/reset-password?token=${token}`;
  }

  async validatePasswordResetLink(token: string): Promise<string> {
    const magicLink =
      await this.magicLinkRepository.getMagicLinkByTokenHash(token);
    if (!magicLink) {
      throw new UnauthorizedError("Invalid or expired password reset token.");
    }

    if (
      magicLink.expiresAt < new Date() ||
      magicLink.type !== "PASSWORD_RESET"
    ) {
      throw new UnauthorizedError("Invalid or expired password reset token.");
    }

    const isValid = await argon.verify(magicLink.tokenHash, token);
    if (!isValid) {
      throw new UnauthorizedError("Invalid or expired password reset token.");
    }

    await this.magicLinkRepository.deleteMagicLinkById(magicLink.id);

    return magicLink.userId;
  }

  async createEmailVerificationLink(
    userId: string,
    platform: string,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString("base64url");

    await this.magicLinkRepository.createMagicLink({
      userId,
      tokenHash: await argon.hash(token),
      tokenType: "EMAIL_VERIFICATION",
      expiresAt: new Date(
        Date.now() + appConfig.EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000,
      ), // 24 hours from now
    });

    return platform === "MOBILE"
      ? `${appConfig.MOBILE_APP_URL}/verify-email?token=${token}`
      : `${appConfig.FRONTEND_URL}/verify-email?token=${token}`;
  }

  async validateEmailVerificationLink(token: string): Promise<string> {
    const magicLink =
      await this.magicLinkRepository.getMagicLinkByTokenHash(token);
    if (!magicLink) {
      throw new UnauthorizedError(
        "Invalid or expired email verification token.",
      );
    }

    if (
      magicLink.expiresAt < new Date() ||
      magicLink.type !== "EMAIL_VERIFICATION"
    ) {
      throw new UnauthorizedError(
        "Invalid or expired email verification token.",
      );
    }

    const isValid = await argon.verify(magicLink.tokenHash, token);
    if (!isValid) {
      throw new UnauthorizedError(
        "Invalid or expired email verification token.",
      );
    }

    await this.magicLinkRepository.deleteMagicLinkById(magicLink.id);

    return magicLink.userId;
  }
}
