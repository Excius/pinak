import { PrismaClient } from "../generated/prisma/client.js";

export class MagicLinkRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMagicLink(data: {
    userId: string;
    tokenHash: string;
    tokenType: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
    expiresAt: Date;
  }) {
    return this.prisma.magicLink.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        type: data.tokenType,
        expiresAt: data.expiresAt,
      },
    });
  }

  async getMagicLinkByTokenHash(tokenHash: string) {
    return this.prisma.magicLink.findUnique({
      where: { tokenHash },
    });
  }

  async deleteMagicLinkById(id: string) {
    return this.prisma.magicLink.delete({
      where: { id },
    });
  }
}
