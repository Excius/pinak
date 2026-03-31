import { Prisma } from "../generated/prisma/client.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import { isPrismaP2002 } from "../lib/prisma-errors.js";
import { BrandRepository } from "../repositories/brand.repository.js";

export class BrandService {
  constructor(private repo: BrandRepository) {}

  listBrands(activeOnly = false) {
    return this.repo.list(activeOnly);
  }

  getBrandById(id: string) {
    return this.repo.getById(id);
  }

  getBrandBySlug(slug: string) {
    return this.repo.getBySlug(slug);
  }

  async createBrand(data: Prisma.BrandCreateInput) {
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

  async updateBrand(id: string, data: Prisma.BrandUpdateInput) {
    const brand = await this.getBrandById(id);
    if (!brand) throw new NotFoundError("Brand not found");

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
    return this.repo.delete(id);
  }
}
