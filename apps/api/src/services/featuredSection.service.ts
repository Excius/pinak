import type { Prisma } from "../generated/prisma/client.js";
import type { FeaturedType } from "../generated/prisma/enums.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import {
  FeaturedSectionRepository,
  type FeaturedSectionWithCount,
} from "../repositories/featuredSection.repository.js";

type FeaturedSectionCreateInput = {
  title: string;
  type: FeaturedType;
  priority?: number;
};

type FeaturedSectionUpdateInput = {
  title?: string;
  type?: FeaturedType;
  priority?: number;
};

export class FeaturedSectionService {
  constructor(private repository: FeaturedSectionRepository) {}

  async listFeaturedSections(): Promise<FeaturedSectionWithCount[]> {
    return this.repository.list();
  }

  async getFeaturedSectionById(id: string): Promise<FeaturedSectionWithCount> {
    const section = await this.repository.getById(id);
    if (!section) {
      throw new NotFoundError("Featured section not found");
    }
    return section;
  }

  async createFeaturedSection(
    data: FeaturedSectionCreateInput,
  ): Promise<FeaturedSectionWithCount> {
    const createData: Prisma.FeaturedSectionCreateInput = {
      title: data.title.trim(),
      type: data.type,
      priority: data.priority ?? 0,
    };

    return this.repository.create(createData);
  }

  async updateFeaturedSection(
    id: string,
    data: FeaturedSectionUpdateInput,
  ): Promise<FeaturedSectionWithCount> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new NotFoundError("Featured section not found");
    }

    const updateData: Prisma.FeaturedSectionUpdateInput = {
      ...(data.title ? { title: data.title.trim() } : {}),
      ...(data.type ? { type: data.type } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
    };

    return this.repository.update(id, updateData);
  }

  async deleteFeaturedSection(id: string): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new NotFoundError("Featured section not found");
    }

    await this.repository.delete(id);
  }

  async restoreFeaturedSection(id: string): Promise<FeaturedSectionWithCount> {
    const existing = await this.repository.getById(id, true);
    if (!existing) {
      throw new NotFoundError("Featured section not found");
    }
    return this.repository.restore(id);
  }

  async hardDeleteFeaturedSection(id: string): Promise<void> {
    const existing = await this.repository.getById(id, true);
    if (!existing) {
      throw new NotFoundError("Featured section not found");
    }

    const productCount = existing._count.products;
    if (productCount > 0) {
      throw new ValidationError(
        `Cannot hard delete section: ${productCount} product(s) are still linked. Remove products from this section first.`,
      );
    }

    await this.repository.hardDelete(id);
  }

  // Image management for FeaturedSections
  async addFeaturedSectionImage(
    featuredSectionId: string,
    data: Prisma.FeaturedSectionImageCreateInput,
  ) {
    const section = await this.repository.getById(featuredSectionId);
    if (!section) {
      throw new ValidationError("Featured section not found");
    }

    const sanitizedData = { ...data } as Prisma.FeaturedSectionImageCreateInput;

    if (sanitizedData.url) {
      try {
        new URL(sanitizedData.url as string);
      } catch {
        throw new ValidationError("Invalid image URL format");
      }
    }

    if (sanitizedData.altText) {
      sanitizedData.altText = (sanitizedData.altText as string).trim();
    }

    sanitizedData.featuredSection = { connect: { id: featuredSectionId } };

    return this.repository.addFeaturedSectionImage(
      featuredSectionId,
      sanitizedData as Prisma.FeaturedSectionImageCreateInput,
    );
  }

  async setPrimaryImage(imageId: string) {
    const image = await this.repository.getFeaturedSectionImageById(imageId);
    if (!image) {
      throw new ValidationError("Image not found");
    }

    if (image.isDeleted) {
      throw new ValidationError("Cannot set deleted image as primary");
    }

    return this.repository.setPrimaryImage(imageId);
  }

  async getAllImages(featuredSectionId: string) {
    const section = await this.repository.getById(featuredSectionId, true);
    if (!section) {
      throw new NotFoundError("Featured section not found");
    }
    return this.repository.getAllImages(featuredSectionId);
  }

  async softDeleteImage(id: string) {
    const image = await this.repository.getFeaturedSectionImageById(id);
    if (!image) throw new NotFoundError("Image not found");
    return this.repository.softDeleteImage(id);
  }

  async restoreImage(id: string) {
    const image = await this.repository.getFeaturedSectionImageById(id);
    if (!image) throw new NotFoundError("Image not found");
    return this.repository.restoreImage(id);
  }

  async hardDeleteImage(id: string) {
    const image = await this.repository.getFeaturedSectionImageById(id);
    if (!image) throw new NotFoundError("Image not found");
    return this.repository.hardDeleteImage(id);
  }
}
