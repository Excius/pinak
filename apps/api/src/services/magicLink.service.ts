import { MagicLinkRepository } from "../repositories/magicLink.repository.js";
import crypto from "crypto";
import argon from "argon2";
import appConfig from "../lib/config.js";
import { UnauthorizedError } from "../lib/error.js";

export class MagicLinkService {
  constructor(private readonly magicLinkRepository: MagicLinkRepository) {}

  async createPasswordResetToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("base64url");

    await this.magicLinkRepository.createMagicLink({
      userId,
      tokenHash: await argon.hash(token),
      tokenType: "PASSWORD_RESET",
      expiresAt: new Date(
        Date.now() + appConfig.FORGOT_PASSWWORD_EXPIRY_MINUTES * 60 * 1000,
      ), // 15 minutes from now
    });

    return token;
  }

  async validatePasswordResetToken(token: string): Promise<boolean> {
    const magicLink =
      await this.magicLinkRepository.getMagicLinkByTokenHash(token);
    if (!magicLink) {
      throw new UnauthorizedError("Invalid or expired password reset token.");
    }

    if (magicLink.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired password reset token.");
    }

    const isValid = await argon.verify(magicLink.tokenHash, token);
    if (!isValid) {
      throw new UnauthorizedError("Invalid or expired password reset token.");
    }

    await this.magicLinkRepository.deleteMagicLinkById(magicLink.id);

    return isValid;
  }

  async createEmailVerificationToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("base64url");

    await this.magicLinkRepository.createMagicLink({
      userId,
      tokenHash: await argon.hash(token),
      tokenType: "EMAIL_VERIFICATION",
      expiresAt: new Date(
        Date.now() + appConfig.EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000,
      ), // 24 hours from now
    });

    return token;
  }

  async validateEmailVerificationToken(token: string): Promise<string> {
    const magicLink =
      await this.magicLinkRepository.getMagicLinkByTokenHash(token);
    if (!magicLink) {
      throw new UnauthorizedError(
        "Invalid or expired email verification token.",
      );
    }

    if (magicLink.expiresAt < new Date()) {
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
