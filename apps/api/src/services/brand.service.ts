import { Prisma } from "../generated/prisma/client.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import { isPrismaP2002 } from "../lib/prisma-errors.js";
import { BrandRepository } from "../repositories/brand.repository.js";
import { uploadBuffer, deleteObject, extractS3KeyFromUrl } from "../lib/s3.js";
import appConfig from "../lib/config.js";
import logger from "../lib/logger.js";

export class BrandService {
  constructor(private repo: BrandRepository) {}

  listBrands(activeOnly = false) {
    return this.repo.list(activeOnly);
  }

  getBrandById(id: string, activeOnly = false) {
    return this.repo.getById(id, activeOnly);
  }

  getBrandBySlug(slug: string, activeOnly = false) {
    return this.repo.getBySlug(slug, activeOnly);
  }

  async createBrand(
    data: Prisma.BrandCreateInput,
    fileBuffer?: Buffer,
    contentType?: string,
  ) {
    if (fileBuffer) {
      if (!appConfig.S3_ENABLED) {
        throw new ValidationError("S3 is not enabled on the server");
      }
      let ext = "png";
      if (contentType) {
        if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
        else if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("webp")) ext = "webp";
        else if (contentType.includes("svg")) ext = "svg";
      }
      const rand = Math.random().toString(36).slice(2, 8);
      const slugVal = (data.slug as string) || (data.name as string) || "brand";
      const key = `brands/${slugVal}/${Date.now()}-${rand}.${ext}`;
      data.logoUrl = await uploadBuffer(fileBuffer, key, contentType, true);
    }

    const exists = await this.repo.findByNameOrSlug(
      data.name as string,
      data.slug as string,
    );
    if (exists)
      throw new ValidationError("Brand with same name or slug already exists");
    try {
      return await this.repo.create(data);
    } catch (err) {
      // use type-guard helper to detect Prisma unique-constraint error
      if (isPrismaP2002(err))
        throw new ValidationError(
          "Brand with same name or slug already exists",
        );
      throw err;
    }
  }

  async updateBrand(
    id: string,
    data: Prisma.BrandUpdateInput,
    fileBuffer?: Buffer,
    contentType?: string,
  ) {
    const brand = await this.getBrandById(id);
    if (!brand) throw new NotFoundError("Brand not found");

    if (fileBuffer) {
      if (!appConfig.S3_ENABLED) {
        throw new ValidationError("S3 is not enabled on the server");
      }
      let ext = "png";
      if (contentType) {
        if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
        else if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("webp")) ext = "webp";
        else if (contentType.includes("svg")) ext = "svg";
      }
      const rand = Math.random().toString(36).slice(2, 8);
      const slugVal = (data.slug as string) || brand.slug || "brand";
      const key = `brands/${slugVal}/${Date.now()}-${rand}.${ext}`;
      data.logoUrl = await uploadBuffer(fileBuffer, key, contentType, true);

      // Clean up old S3 logo if present
      if (brand.logoUrl && appConfig.S3_ENABLED) {
        try {
          const oldKey = extractS3KeyFromUrl(brand.logoUrl);
          if (oldKey) {
            await deleteObject(oldKey);
          }
        } catch (err) {
          logger.warn({ id, err }, "Failed to delete old S3 object for brand logo");
        }
      }
    }

    // Helper to extract string if provided directly or via `{ set: string }` update format
    const extractStringField = (
      v?: string | Prisma.StringFieldUpdateOperationsInput,
    ): string | undefined => {
      if (!v) return undefined;
      if (typeof v === "string") return v;
      if (typeof v === "object" && v !== null && "set" in v) {
        const maybe = v as { set?: unknown };
        if (typeof maybe.set === "string") return maybe.set;
      }
      return undefined;
    };

    const name = extractStringField(
      data.name as string | Prisma.StringFieldUpdateOperationsInput | undefined,
    );
    const slug = extractStringField(
      data.slug as string | Prisma.StringFieldUpdateOperationsInput | undefined,
    );

    if (name || slug) {
      const conflict = await this.repo.findConflictOnUpdate(
        id,
        name ?? undefined,
        slug ?? undefined,
      );
      if (conflict)
        throw new ValidationError("Another brand with same name/slug exists");
    }
    return this.repo.update(id, data);
  }

  async deleteBrand(id: string) {
    const brand = await this.getBrandById(id);
    if (!brand) throw new NotFoundError("Brand not found");
    // soft-delete or hard-delete depending on needs — here we hard-delete if no products
    const count = await this.repo.countProducts(id);
    if (count > 0)
      throw new ValidationError(
        "Cannot delete brand while products reference it",
      );

    if (brand.logoUrl && appConfig.S3_ENABLED) {
      try {
        const key = extractS3KeyFromUrl(brand.logoUrl);
        if (key) {
          await deleteObject(key);
        }
      } catch (err) {
        logger.warn({ id, err }, "Failed to delete S3 object for brand logo");
      }
    }

    return this.repo.delete(id);
  }
}
