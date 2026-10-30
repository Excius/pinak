import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export class PageRepository {
  constructor(private prisma: PrismaClient) {}

  async listPublicActive() {
    return this.prisma.page.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { title: "asc" },
    });
  }

  async getBySlug(slug: string, activeOnly = true) {
    return this.prisma.page.findFirst({
      where: {
        slug,
        ...(activeOnly ? { isActive: true, isDeleted: false } : {}),
      },
    });
  }

  async getById(id: string, includeDeleted = false) {
    return this.prisma.page.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });
  }

  async findMany(params: {
    where?: Prisma.PageWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.PageOrderByWithRelationInput;
  }) {
    return this.prisma.page.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy ?? { createdAt: "desc" },
    });
  }

  async count(where?: Prisma.PageWhereInput) {
    return this.prisma.page.count({ where });
  }

  async create(data: Prisma.PageCreateInput) {
    return this.prisma.page.create({ data });
  }

  async update(id: string, data: Prisma.PageUpdateInput) {
    return this.prisma.page.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.page.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
  }

  async restore(id: string) {
    return this.prisma.page.update({
      where: { id },
      data: {
        isDeleted: false,
        isActive: true,
      },
    });
  }
}
