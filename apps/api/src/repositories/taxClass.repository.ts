import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export class TaxClassRepository {
  constructor(private prisma: PrismaClient) {}

  list() {
    return this.prisma.taxClass.findMany({ orderBy: { rate: "asc" } });
  }

  getById(id: string) {
    return this.prisma.taxClass.findUnique({ where: { id } });
  }

  findByName(name?: string) {
    if (!name) return null;
    return this.prisma.taxClass.findUnique({ where: { name } });
  }

  create(data: Prisma.TaxClassCreateInput) {
    return this.prisma.taxClass.create({ data });
  }

  update(id: string, data: Prisma.TaxClassUpdateInput) {
    return this.prisma.taxClass.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.taxClass.delete({ where: { id } });
  }

  async countProductsByTaxClass(id: string) {
    const [products, variants] = await Promise.all([
      this.prisma.product.count({ where: { taxClassId: id } }),
      this.prisma.productVariant.count({ where: { taxClassId: id } }),
    ]);
    return products + variants;
  }
}
