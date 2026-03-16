import { PrismaClient } from "../generated/prisma/client.js";

export class RelatedProductRepository {
  constructor(private prisma: PrismaClient) {}

  getProductById(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  exists(productId: string, relatedProductId: string) {
    return this.prisma.relatedProduct.findUnique({
      where: { productId_relatedProductId: { productId, relatedProductId } },
    });
  }

  create(productId: string, relatedProductId: string, sortOrder = 0) {
    return this.prisma.relatedProduct.create({
      data: { productId, relatedProductId, sortOrder },
    });
  }

  delete(productId: string, relatedProductId: string) {
    return this.prisma.relatedProduct.delete({
      where: { productId_relatedProductId: { productId, relatedProductId } },
    });
  }

  listRelated(productId: string) {
    return this.prisma.relatedProduct.findMany({
      where: { productId },
      include: { relatedProduct: true },
      orderBy: { sortOrder: "asc" },
    });
  }
}
