import type { Prisma } from "../generated/prisma/client.js";
import type { FeaturedType } from "../generated/prisma/enums.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import { uploadBuffer, deleteObject, extractS3KeyFromUrl } from "../lib/s3.js";
import appConfig from "../lib/config.js";
import logger from "../lib/logger.js";
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
    data: Partial<Prisma.FeaturedSectionImageCreateInput>,
    fileBuffer?: Buffer,
    contentType?: string,
  ) {
    const section = await this.repository.getById(featuredSectionId);
    if (!section) {
      throw new ValidationError("Featured section not found");
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
    const key = `featured-sections/${featuredSectionId}/${timestamp}-${rand}.${ext}`;

    const publicUrl = await uploadBuffer(
      fileBuffer,
      key,
      contentType,
      true,
    );

    const sanitizedData: Prisma.FeaturedSectionImageCreateInput = {
      url: publicUrl,
      altText: data.altText ? (data.altText as string).trim() : null,
      isPrimary: data.isPrimary !== undefined ? Boolean(data.isPrimary) : false,
      featuredSection: { connect: { id: featuredSectionId } },
    };

    return this.repository.addFeaturedSectionImage(
      featuredSectionId,
      sanitizedData,
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

  async deleteImage(id: string) {
    const image = await this.repository.getFeaturedSectionImageById(id);
    if (!image) throw new NotFoundError("Image not found");

    if (image.url && appConfig.S3_ENABLED) {
      try {
        const key = extractS3KeyFromUrl(image.url);
        if (key) {
          await deleteObject(key);
        }
      } catch (err) {
        logger.warn({ id, err }, "Failed to delete S3 object for featured section image");
      }
    }

    return this.repository.hardDeleteImage(id);
  }

  softDeleteImage = this.deleteImage;
  hardDeleteImage = this.deleteImage;
}
