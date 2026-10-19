import { CategoryRepository } from "../repositories/category.repository.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import { isPrismaP2002 } from "../lib/prisma-errors.js";
import { Prisma } from "../generated/prisma/client.js";
import { uploadBuffer, deleteObject, extractS3KeyFromUrl } from "../lib/s3.js";
import appConfig from "../lib/config.js";
import logger from "../lib/logger.js";

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

  async listCategories(parentId?: string | null, includeChildren = true) {
    return this.categoryRepository.list(parentId, includeChildren);
  }

  async listTopCategories() {
    return this.categoryRepository.listTopCategories();
  }

  async getCategoryTree() {
    return this.categoryRepository.getTree();
  }

  async listCategoriesAdmin(parentId?: string | null) {
    return this.categoryRepository.listAdmin(parentId);
  }

  async listTopCategoriesAdmin() {
    return this.categoryRepository.listTopAdmin();
  }

  async getCategoryTreeAdmin() {
    return this.categoryRepository.getTreeAdmin();
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

  async getCategoryByIdAdmin(id: string) {
    const category = await this.categoryRepository.getByIdAdmin(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return category;
  }

  async getCategoryBySlugAdmin(slug: string) {
    const category = await this.categoryRepository.getBySlugAdmin(slug);
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

    // Clean up category images in S3
    if (appConfig.S3_ENABLED) {
      try {
        const images = await this.categoryRepository.getAllImages(id);
        if (images && images.length > 0) {
          for (const img of images) {
            if (img.url) {
              const key = extractS3KeyFromUrl(img.url);
              if (key) await deleteObject(key);
            }
          }
        }
      } catch (err) {
        logger.warn({ id, err }, "Failed to clean up S3 objects for category images during deletion");
      }
    }

    return this.categoryRepository.delete(id);
  }

  // Image management for categories
  async addCategoryImage(
    categoryId: string,
    data: Partial<Prisma.CategoryImageCreateInput>,
    fileBuffer?: Buffer,
    contentType?: string,
  ) {
    const category = await this.categoryRepository.getById(categoryId);
    if (!category) {
      throw new ValidationError("Category not found");
    }

    if (!fileBuffer) {
      throw new ValidationError("Image file is required");
    }

    if (!appConfig.S3_ENABLED) {
      throw new ValidationError("S3 is not enabled on the server");
    }

    let ext = "bin";
    if (contentType) {
      if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
      else if (contentType.includes("png")) ext = "png";
      else if (contentType.includes("webp")) ext = "webp";
      else if (contentType.includes("gif")) ext = "gif";
      else if (contentType.includes("svg")) ext = "svg";
    }

    const rand = Math.random().toString(36).slice(2, 8);
    const timestamp = Date.now();
    const key = `categories/${categoryId}/${timestamp}-${rand}.${ext}`;

    const publicUrl = await uploadBuffer(
      fileBuffer,
      key,
      contentType,
      true,
    );

    const sanitizedData: Prisma.CategoryImageCreateInput = {
      url: publicUrl,
      altText: data.altText ? (data.altText as string).trim() : null,
      isPrimary: data.isPrimary !== undefined ? Boolean(data.isPrimary) : false,
      category: { connect: { id: categoryId } },
    };

    return this.categoryRepository.addCategoryImage(
      categoryId,
      sanitizedData,
    );
  }

  async setPrimaryImage(imageId: string) {
    const image = await this.categoryRepository.getCategoryImageById(imageId);
    if (!image) {
      throw new ValidationError("Image not found");
    }

    if (image.isDeleted) {
      throw new ValidationError("Cannot set deleted image as primary");
    }

    return this.categoryRepository.setPrimaryImage(imageId);
  }

  async getAllImages(categoryId: string) {
    const category = await this.categoryRepository.getById(categoryId);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return this.categoryRepository.getAllImages(categoryId);
  }

  async deleteImage(id: string) {
    const image = await this.categoryRepository.getCategoryImageById(id);
    if (!image) throw new NotFoundError("Image not found");

    if (image.url && appConfig.S3_ENABLED) {
      try {
        const key = extractS3KeyFromUrl(image.url);
        if (key) {
          await deleteObject(key);
        }
      } catch (err) {
        logger.warn({ id, err }, "Failed to delete S3 object for category image");
      }
    }

    return this.categoryRepository.hardDeleteImage(id);
  }

  softDeleteImage = this.deleteImage;
  hardDeleteImage = this.deleteImage;
}
