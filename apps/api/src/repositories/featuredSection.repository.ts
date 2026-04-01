import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export class FeaturedSectionRepository {
  constructor(private prisma: PrismaClient) {}

  list() {
    return this.prisma.featuredSection.findMany({
      orderBy: { priority: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  getById(id: string) {
    return this.prisma.featuredSection.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  create(data: Prisma.FeaturedSectionCreateInput) {
    return this.prisma.featuredSection.create({ data });
  }

  update(id: string, data: Prisma.FeaturedSectionUpdateInput) {
    return this.prisma.featuredSection.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.featuredSection.delete({ where: { id } });
  }

  countFeaturedProducts(sectionId: string) {
    return this.prisma.featuredProduct.count({ where: { sectionId } });
  }
}
