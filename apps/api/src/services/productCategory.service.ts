import { ValidationError, NotFoundError } from "../lib/error.js";
import { ProductCategoryRepository } from "../repositories/productCategory.repository.js";

export class ProductCategoryService {
  constructor(private repo: ProductCategoryRepository) {}

  async addProductToCategory(productId: string, categoryId: string) {
    const [p, c] = await Promise.all([
      this.repo.getProductById(productId),
      this.repo.getCategoryById(categoryId),
    ]);
    if (!p) throw new NotFoundError("Product not found");
    if (!c) throw new NotFoundError("Category not found");
    const exists = await this.repo.exists(productId, categoryId);
    if (exists)
      throw new ValidationError("Product already assigned to this category");
    return this.repo.create(productId, categoryId);
  }

  async removeProductFromCategory(productId: string, categoryId: string) {
    return this.repo.delete(productId, categoryId);
  }

  async setCategoriesForProduct(productId: string, categoryIds: string[]) {
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      // Empty array is valid — clears all category associations
      return this.repo.setCategoriesForProduct(productId, []);
    }
    // Validate that all provided category IDs exist
    const categories = await Promise.all(
      categoryIds.map((id) => this.repo.getCategoryById(id)),
    );
    const missing = categoryIds.filter((id, i) => !categories[i]);
    if (missing.length > 0) {
      throw new NotFoundError(
        `The following category IDs do not exist: ${missing.join(", ")}`,
      );
    }
    // Replace existing categories with provided list
    return this.repo.setCategoriesForProduct(productId, categoryIds);
  }

  listCategoriesForProduct(productId: string) {
    return this.repo.listCategoriesForProduct(productId);
  }
}
