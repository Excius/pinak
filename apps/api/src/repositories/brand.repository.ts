import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export class BrandRepository {
  constructor(private prisma: PrismaClient) {}

  list(activeOnly = false) {
    return this.prisma.brand.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { name: "asc" },
    });
  }

  getById(id: string, activeOnly = false) {
    return this.prisma.brand.findUnique({
      where: {
        id,
        ...(activeOnly ? { isActive: true } : {}),
      },
    });
  }

  getBySlug(slug: string, activeOnly = false) {
    return this.prisma.brand.findUnique({
      where: {
        slug,
        ...(activeOnly ? { isActive: true } : {}),
      },
    });
  }

  findByNameOrSlug(name?: string, slug?: string) {
    return this.prisma.brand.findFirst({ where: { OR: [{ name }, { slug }] } });
  }

  findConflictOnUpdate(id: string, name?: string, slug?: string) {
    return this.prisma.brand.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: [{ name: name ?? undefined }, { slug: slug ?? undefined }] },
        ],
      },
    });
  }

  create(data: Prisma.BrandCreateInput) {
    return this.prisma.brand.create({ data });
  }

  update(id: string, data: Prisma.BrandUpdateInput) {
    return this.prisma.brand.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }

  countProducts(brandId: string) {
    return this.prisma.product.count({ where: { brandId } });
  }
}
