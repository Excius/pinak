import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export class FilterRepository {
  constructor(private prisma: PrismaClient) {}

  listGroups(activeOnly = false) {
    return this.prisma.filterGroup.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: { values: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
  }

  getGroupById(id: string) {
    return this.prisma.filterGroup.findUnique({
      where: { id },
      include: { values: { orderBy: { sortOrder: "asc" } } },
    });
  }

  findGroupByName(name?: string) {
    if (!name) return null;
    return this.prisma.filterGroup.findUnique({ where: { name } });
  }

  createGroup(data: Prisma.FilterGroupCreateInput) {
    return this.prisma.filterGroup.create({ data });
  }

  updateGroup(id: string, data: Prisma.FilterGroupUpdateInput) {
    return this.prisma.filterGroup.update({ where: { id }, data });
  }

  countFilterValues(filterGroupId: string) {
    return this.prisma.filterValue.count({ where: { filterGroupId } });
  }

  deleteGroup(id: string) {
    return this.prisma.filterGroup.delete({ where: { id } });
  }

  // FilterValue helpers
  getFilterValueById(id: string) {
    return this.prisma.filterValue.findUnique({ where: { id } });
  }

  findFilterValueBySlug(filterGroupId: string, slug: string) {
    return this.prisma.filterValue.findFirst({
      where: { filterGroupId, slug },
    });
  }

  createFilterValue(
    filterGroupId: string,
    data: { name: string; slug?: string; sortOrder?: number },
  ) {
    const slug = data.slug ?? data.name.toLowerCase().replace(/\s+/g, "-");
    return this.prisma.filterValue.create({
      data: {
        filterGroupId,
        name: data.name,
        slug,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  updateFilterValue(id: string, data: Prisma.FilterValueUpdateInput) {
    return this.prisma.filterValue.update({ where: { id }, data });
  }

  countProductFilterRefs(filterValueId: string) {
    return this.prisma.productFilterValue.count({ where: { filterValueId } });
  }

  deleteFilterValue(id: string) {
    return this.prisma.filterValue.delete({ where: { id } });
  }

  // product-filter linking
  getProductById(productId: string) {
    return this.prisma.product.findUnique({ where: { id: productId } });
  }

  existsProductFilterRef(productId: string, filterValueId: string) {
    return this.prisma.productFilterValue.findUnique({
      where: { productId_filterValueId: { productId, filterValueId } },
    });
  }

  addFilterToProduct(productId: string, filterValueId: string) {
    return this.prisma.productFilterValue.create({
      data: { productId, filterValueId },
    });
  }

  removeFilterFromProduct(productId: string, filterValueId: string) {
    return this.prisma.productFilterValue.delete({
      where: { productId_filterValueId: { productId, filterValueId } },
    });
  }
}
