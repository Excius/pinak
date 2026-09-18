import { DynamicAssetRepository } from "../repositories/dynamicAsset.repository.js";
import { NotFoundError, ValidationError, ConflictError } from "../lib/error.js";
import { uploadBuffer, deleteObject } from "../lib/s3.js";
import appConfig from "../lib/config.js";
import type { Prisma } from "../generated/prisma/client.js";

export class DynamicAssetService {
  constructor(private repository: DynamicAssetRepository) {}

  async listActive() {
    return this.repository.listActive();
  }

  async listAll(includeDeleted = false) {
    return this.repository.list(includeDeleted);
  }

  async getBySlug(slug: string) {
    const asset = await this.repository.getBySlug(slug);
    if (!asset) {
      throw new NotFoundError("Dynamic asset not found");
    }
    return asset;
  }

  async getById(id: string, includeDeleted = false) {
    const asset = await this.repository.getById(id, includeDeleted);
    if (!asset) {
      throw new NotFoundError("Dynamic asset not found");
    }
    return asset;
  }

  async create(
    data: {
      slug: string;
      type?: "IMAGE" | "VIDEO" | "DOCUMENT";
      title?: string;
      description?: string;
      metadata?: unknown;
    },
    fileBuffer: Buffer,
    contentType?: string,
  ) {
    if (!appConfig.S3_ENABLED) {
      throw new ValidationError("S3 is not enabled on the server");
    }

    // Validate slug uniqueness
    const existing = await this.repository.findBySlug(data.slug);
    if (existing) {
      throw new ConflictError(
        `A dynamic asset with slug "${data.slug}" already exists`,
      );
    }

    // Determine file extension from content type
    const ext = this.getExtension(contentType);

    // Build S3 key
    const rand = Math.random().toString(36).slice(2, 8);
    const timestamp = Date.now();
    const key = `dynamic-assets/${data.slug}/${timestamp}-${rand}.${ext}`;

    // Upload to S3
    const publicUrl = await uploadBuffer(fileBuffer, key, contentType, true);

    // Build create input
    const createInput: Prisma.DynamicAssetCreateInput = {
      slug: data.slug,
      url: publicUrl,
      s3Key: key,
      type: data.type || "IMAGE",
      title: data.title || null,
      description: data.description || null,
      metadata: data.metadata ?? undefined,
    };

    return this.repository.create(createInput);
  }

  async update(
    id: string,
    data: {
      slug?: string;
      title?: string;
      description?: string;
      type?: "IMAGE" | "VIDEO" | "DOCUMENT";
      isActive?: boolean;
      metadata?: unknown;
    },
  ) {
    const asset = await this.repository.getById(id, true);
    if (!asset) {
      throw new NotFoundError("Dynamic asset not found");
    }

    // Validate slug uniqueness if changing
    if (data.slug && data.slug !== asset.slug) {
      const existing = await this.repository.findBySlug(data.slug);
      if (existing) {
        throw new ConflictError(
          `A dynamic asset with slug "${data.slug}" already exists`,
        );
      }
    }

    const updateInput: Prisma.DynamicAssetUpdateInput = {};
    if (data.slug !== undefined) updateInput.slug = data.slug;
    if (data.title !== undefined) updateInput.title = data.title;
    if (data.description !== undefined) updateInput.description = data.description;
    if (data.type !== undefined) updateInput.type = data.type;
    if (data.isActive !== undefined) updateInput.isActive = data.isActive;
    if (data.metadata !== undefined) updateInput.metadata = data.metadata as Prisma.InputJsonValue;

    return this.repository.update(id, updateInput);
  }

  async replaceFile(id: string, fileBuffer: Buffer, contentType?: string) {
    if (!appConfig.S3_ENABLED) {
      throw new ValidationError("S3 is not enabled on the server");
    }

    const asset = await this.repository.getById(id, true);
    if (!asset) {
      throw new NotFoundError("Dynamic asset not found");
    }

    // Delete old S3 object if we have a key
    if (asset.s3Key) {
      try {
        await deleteObject(asset.s3Key);
      } catch {
        // Non-fatal: old file cleanup failed, continue with upload
      }
    }

    // Upload new file
    const ext = this.getExtension(contentType);
    const rand = Math.random().toString(36).slice(2, 8);
    const timestamp = Date.now();
    const key = `dynamic-assets/${asset.slug}/${timestamp}-${rand}.${ext}`;

    const publicUrl = await uploadBuffer(fileBuffer, key, contentType, true);

    return this.repository.update(id, {
      url: publicUrl,
      s3Key: key,
    });
  }

  async softDelete(id: string) {
    const asset = await this.repository.getById(id, true);
    if (!asset) {
      throw new NotFoundError("Dynamic asset not found");
    }
    return this.repository.softDelete(id);
  }

  async restore(id: string) {
    const asset = await this.repository.getById(id, true);
    if (!asset) {
      throw new NotFoundError("Dynamic asset not found");
    }
    if (!asset.isDeleted) {
      throw new ValidationError("Asset is not deleted");
    }
    return this.repository.restore(id);
  }

  async hardDelete(id: string) {
    const asset = await this.repository.getById(id, true);
    if (!asset) {
      throw new NotFoundError("Dynamic asset not found");
    }

    // Delete S3 object if we have a key
    if (asset.s3Key && appConfig.S3_ENABLED) {
      try {
        await deleteObject(asset.s3Key);
      } catch {
        // Non-fatal: old file cleanup failed
      }
    }

    return this.repository.hardDelete(id);
  }

  private getExtension(contentType?: string): string {
    if (!contentType) return "bin";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
    if (contentType.includes("png")) return "png";
    if (contentType.includes("webp")) return "webp";
    if (contentType.includes("gif")) return "gif";
    if (contentType.includes("svg")) return "svg";
    if (contentType.includes("mp4")) return "mp4";
    if (contentType.includes("webm")) return "webm";
    if (contentType.includes("pdf")) return "pdf";
    return "bin";
  }
}
