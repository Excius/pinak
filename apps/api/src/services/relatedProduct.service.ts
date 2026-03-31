import { ValidationError, NotFoundError } from "../lib/error.js";
import { RelatedProductRepository } from "../repositories/relatedProduct.repository.js";

export class RelatedProductService {
  constructor(private repo: RelatedProductRepository) {}

  async addRelatedProduct(
    productId: string,
    relatedProductId: string,
    sortOrder = 0,
  ) {
    if (productId === relatedProductId)
      throw new ValidationError("Product cannot be related to itself");
    const [p, rp] = await Promise.all([
      this.repo.getProductById(productId),
      this.repo.getProductById(relatedProductId),
    ]);
    if (!p || !rp)
      throw new NotFoundError("Product or related product not found");
    const exists = await this.repo.exists(productId, relatedProductId);
    if (exists) throw new ValidationError("Related product already exists");
    return this.repo.create(productId, relatedProductId, sortOrder);
  }

  async removeRelatedProduct(productId: string, relatedProductId: string) {
    return this.repo.delete(productId, relatedProductId);
  }

  listRelated(productId: string) {
    return this.repo.listRelated(productId);
  }
}
