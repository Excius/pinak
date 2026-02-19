import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export class ProductCategoryRepository {
  constructor(private prisma: PrismaClient) {}

  getProductById(productId: string) {
    return this.prisma.product.findUnique({ where: { id: productId } });
  }

  getCategoryById(categoryId: string) {
    return this.prisma.category.findUnique({ where: { id: categoryId } });
  }

  exists(productId: string, categoryId: string) {
    return this.prisma.productCategory.findUnique({
      where: { productId_categoryId: { productId, categoryId } },
    });
  }

  create(productId: string, categoryId: string) {
    return this.prisma.productCategory.create({
      data: { productId, categoryId },
    });
  }

  delete(productId: string, categoryId: string) {
    return this.prisma.productCategory.delete({
      where: { productId_categoryId: { productId, categoryId } },
    });
  }

  setCategoriesForProduct(productId: string, categoryIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({ where: { productId } });
      return tx.productCategory.createMany({
        data: categoryIds.map((cid) => ({ productId, categoryId: cid })),
      });
    });
  }

  listCategoriesForProduct(productId: string) {
    return this.prisma.productCategory.findMany({
      where: { productId },
      include: { category: true },
    });
  }
}
