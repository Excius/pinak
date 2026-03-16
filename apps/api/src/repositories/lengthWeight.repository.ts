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

  countProductsByLengthClass(id: string) {
    return this.prisma.product.count({ where: { lengthClassId: id } });
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

  countProductsByWeightClass(id: string) {
    return this.prisma.product.count({ where: { weightClassId: id } });
  }
}
