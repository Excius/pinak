import { Prisma, PrismaClient } from "../generated/prisma/client.js";

export class AddressRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, data: Prisma.AddressCreateInput, tx?: Prisma.TransactionClient) {
    const execute = async (db: Prisma.TransactionClient) => {
      // If setting as default, unset other defaults for this user
      if (data.isDefault) {
        await db.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return db.address.create({
        data: {
          ...data,
          user: { connect: { id: userId } },
        },
      });
    };

    return tx ? execute(tx) : this.prisma.$transaction(execute);
  }

  async update(id: string, userId: string, data: Prisma.AddressUpdateInput, tx?: Prisma.TransactionClient) {
    const execute = async (db: Prisma.TransactionClient) => {
      if (data.isDefault) {
        await db.address.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return db.address.update({
        where: { id, userId },
        data,
      });
    };

    return tx ? execute(tx) : this.prisma.$transaction(execute);
  }

  async delete(id: string, userId: string, tx?: Prisma.TransactionClient) {
    const db = tx || this.prisma;
    return db.address.delete({
      where: { id, userId },
    });
  }

  async findById(id: string, userId: string) {
    return this.prisma.address.findFirst({
      where: { id, userId },
    });
  }

  async listByUser(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async setDefault(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.address.update({
        where: { id, userId },
        data: { isDefault: true },
      });
    });
  }
}
