import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export class OptionRepository {
  constructor(private prisma: PrismaClient) {}

  listOptions() {
    return this.prisma.option.findMany({
      include: { values: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
  }

  getOptionById(id: string) {
    return this.prisma.option.findUnique({
      where: { id },
      include: { values: { orderBy: { sortOrder: "asc" } } },
    });
  }

  findByName(name: string | undefined) {
    if (!name) return null;
    return this.prisma.option.findUnique({ where: { name } });
  }

  createOption(data: Prisma.OptionCreateInput) {
    return this.prisma.option.create({ data });
  }

  updateOption(id: string, data: Prisma.OptionUpdateInput) {
    return this.prisma.option.update({ where: { id }, data });
  }

  deleteOption(id: string) {
    return this.prisma.option.delete({ where: { id } });
  }

  countOptionValues(optionId: string) {
    return this.prisma.optionValue.count({ where: { optionId } });
  }

  // OptionValue helpers
  createOptionValue(optionId: string, data: { value: string; sortOrder?: number }) {
    return this.prisma.optionValue.create({
      data: {
        optionId,
        value: data.value,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  findOptionValue(optionId: string, value: string) {
    return this.prisma.optionValue.findFirst({ where: { optionId, value } });
  }

  getOptionValueById(id: string) {
    return this.prisma.optionValue.findUnique({ where: { id } });
  }

  updateOptionValue(id: string, data: Prisma.OptionValueUpdateInput) {
    return this.prisma.optionValue.update({ where: { id }, data });
  }

  countVariantOptionValueRefs(optionValueId: string) {
    return this.prisma.variantOptionValue.count({ where: { optionValueId } });
  }

  deleteOptionValue(id: string) {
    return this.prisma.optionValue.delete({ where: { id } });
  }
}
