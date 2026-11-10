import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export class LengthClassRepository {
  constructor(private prisma: PrismaClient) {}

  list() {
    return this.prisma.lengthClass.findMany({ orderBy: { name: "asc" } });
  }

  getById(id: string) {
    return this.prisma.lengthClass.findUnique({ where: { id } });
  }

  findByName(name?: string) {
    if (!name) return null;
    return this.prisma.lengthClass.findUnique({ where: { name } });
  }

  create(data: Prisma.LengthClassCreateInput) {
    return this.prisma.lengthClass.create({ data });
  }

  update(id: string, data: Prisma.LengthClassUpdateInput) {
    return this.prisma.lengthClass.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.lengthClass.delete({ where: { id } });
  }

  async countProductsByLengthClass(id: string) {
    // products, variants and option values can all reference a length class
    const [products, variants, optionValues] = await Promise.all([
      this.prisma.product.count({ where: { lengthClassId: id } }),
      this.prisma.productVariant.count({ where: { lengthClassId: id } }),
      this.prisma.optionValue.count({ where: { lengthClassId: id } }),
    ]);
    return products + variants + optionValues;
  }
}

export class WeightClassRepository {
  constructor(private prisma: PrismaClient) {}

  list() {
    return this.prisma.weightClass.findMany({ orderBy: { name: "asc" } });
  }

  getById(id: string) {
    return this.prisma.weightClass.findUnique({ where: { id } });
  }

  findByName(name?: string) {
    if (!name) return null;
    return this.prisma.weightClass.findUnique({ where: { name } });
  }

  create(data: Prisma.WeightClassCreateInput) {
    return this.prisma.weightClass.create({ data });
  }

  update(id: string, data: Prisma.WeightClassUpdateInput) {
    return this.prisma.weightClass.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.weightClass.delete({ where: { id } });
  }

  async countProductsByWeightClass(id: string) {
    const [products, variants, optionValues] = await Promise.all([
      this.prisma.product.count({ where: { weightClassId: id } }),
      this.prisma.productVariant.count({ where: { weightClassId: id } }),
      this.prisma.optionValue.count({ where: { weightClassId: id } }),
    ]);
    return products + variants + optionValues;
  }
}
