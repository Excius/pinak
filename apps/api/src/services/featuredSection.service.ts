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

    const productCount = existing._count.products;
    if (productCount > 0) {
      throw new ValidationError(
        `Cannot delete section: ${productCount} product(s) are still linked. Remove products from this section first.`,
      );
    }

    await this.repository.delete(id);
  }
}
