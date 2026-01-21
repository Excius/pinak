import { PrismaClient } from "../generated/prisma/client.js";

export class SessionRespository {
  constructor(private prisma: PrismaClient) {}

  findById(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
    });
  }

  revoke(id: string) {
    return this.prisma.session.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  revokeAll(userId: string) {
    return this.prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  create(data: {
    userId: string;
    refreshHash: string;
    expiresAt: Date;
    rotatedFrom?: string;
  }) {
    return this.prisma.session.create({
      data,
    });
  }

  update(
    id: string,
    data: Partial<{
      refreshHash: string;
      expiresAt: Date;
      isRevoked: boolean;
      rotatedFrom: string;
    }>,
  ) {
    return this.prisma.session.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.session.delete({
      where: { id },
    });
  }
}
