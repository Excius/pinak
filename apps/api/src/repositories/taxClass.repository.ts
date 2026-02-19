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

  countProductsByTaxClass(id: string) {
    return this.prisma.product.count({ where: { taxClassId: id } });
  }
}
