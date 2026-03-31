import { CategoryRepository } from "../repositories/category.repository.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import { isPrismaP2002 } from "../lib/prisma-errors.js";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type CategoryCreateInput = {
  name: string;
  slug?: string;
  parentId?: string;
};

type CategoryUpdateInput = {
  name?: string;
  slug?: string;
  parentId?: string | null;
};

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async listCategories(parentId?: string | null) {
    return this.categoryRepository.list(parentId);
  }

  async getCategoryTree() {
    return this.categoryRepository.getTree();
  }

  async getCategoryById(id: string) {
    const category = await this.categoryRepository.getById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.categoryRepository.getBySlug(slug);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return category;
  }

  async createCategory(data: CategoryCreateInput) {
    const name = data.name.trim();
    const slug = data.slug ? data.slug.trim() : generateSlug(name);

    // Validate parentId if provided
    if (data.parentId) {
      const parent = await this.categoryRepository.getById(data.parentId);
      if (!parent) {
        throw new ValidationError("Parent category not found");
      }
    }

    // Check slug uniqueness
    const conflict = await this.categoryRepository.findConflict(slug);
    if (conflict) {
      throw new ValidationError(
        "A category with this slug already exists. Provide a different slug.",
      );
    }

    try {
      return await this.categoryRepository.create({
        name,
        slug,
        ...(data.parentId
          ? { parent: { connect: { id: data.parentId } } }
          : {}),
      });
    } catch (err) {
      if (isPrismaP2002(err)) {
        throw new ValidationError("A category with this slug already exists.");
      }
      throw err;
    }
  }

  async updateCategory(id: string, data: CategoryUpdateInput) {
    const existing = await this.categoryRepository.getById(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    // Prevent a category from being its own parent
    if (data.parentId === id) {
      throw new ValidationError("A category cannot be its own parent.");
    }

    // Validate parentId and prevent circular ancestry
    if (data.parentId) {
      const isCyclic = await this.categoryRepository.wouldCreateCycle(
        id,
        data.parentId,
      );
      if (isCyclic) {
        throw new ValidationError(
          "Setting this parent would create a circular category chain.",
        );
      }
    }

    // Validate parentId exists
    if (data.parentId) {
      const parent = await this.categoryRepository.getById(data.parentId);
      if (!parent) {
        throw new ValidationError("Parent category not found");
      }
    }

    const slug = data.slug
      ? data.slug.trim()
      : data.name
        ? generateSlug(data.name.trim())
        : undefined;

    if (slug) {
      const conflict = await this.categoryRepository.findConflict(slug, id);
      if (conflict) {
        throw new ValidationError(
          "A category with this slug already exists. Provide a different slug.",
        );
      }
    }

    const updateData: Parameters<CategoryRepository["update"]>[1] = {
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(slug ? { slug } : {}),
      ...(data.parentId !== undefined
        ? data.parentId === null
          ? { parent: { disconnect: true } }
          : { parent: { connect: { id: data.parentId } } }
        : {}),
    };

    try {
      return await this.categoryRepository.update(id, updateData);
    } catch (err) {
      if (isPrismaP2002(err)) {
        throw new ValidationError("A category with this slug already exists.");
      }
      throw err;
    }
  }

  async deleteCategory(id: string) {
    const existing = await this.categoryRepository.getById(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const [productCount, childCount] = await Promise.all([
      this.categoryRepository.countProducts(id),
      this.categoryRepository.countChildren(id),
    ]);

    if (productCount > 0) {
      throw new ValidationError(
        `Cannot delete category: ${productCount} product(s) are still linked to it. ` +
          "Remove the product–category associations first.",
      );
    }

    if (childCount > 0) {
      throw new ValidationError(
        `Cannot delete category: it has ${childCount} child categor${childCount > 1 ? "ies" : "y"}. ` +
          "Delete or re-parent the children first.",
      );
    }

    return this.categoryRepository.delete(id);
  }
}
