import { PrismaClient } from "../generated/prisma/client.js";
import type { Prisma } from "../generated/prisma/client.js";

export class DynamicAssetRepository {
  constructor(private prisma: PrismaClient) {}

  async list(includeDeleted = false) {
    return this.prisma.dynamicAsset.findMany({
      where: includeDeleted ? undefined : { isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
  }

  async listActive() {
    return this.prisma.dynamicAsset.findMany({
      where: {
        isDeleted: false,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string, includeDeleted = false) {
    return this.prisma.dynamicAsset.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });
  }

  async getBySlug(slug: string) {
    return this.prisma.dynamicAsset.findFirst({
      where: {
        slug,
        isDeleted: false,
        isActive: true,
      },
    });
  }

  async create(data: Prisma.DynamicAssetCreateInput) {
    return this.prisma.dynamicAsset.create({
      data,
    });
  }

  async update(id: string, data: Prisma.DynamicAssetUpdateInput) {
    return this.prisma.dynamicAsset.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.dynamicAsset.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async restore(id: string) {
    return this.prisma.dynamicAsset.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  async hardDelete(id: string) {
    return this.prisma.dynamicAsset.delete({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.dynamicAsset.findFirst({
      where: { slug },
    });
  }
}
