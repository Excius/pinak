import { Prisma } from "../generated/prisma/client.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import { FeaturedSectionRepository } from "../repositories/featuredSection.repository.js";

type FeaturedSectionCreateInput = {
  title: string;
  type: "EXPERT_PICKS" | "HOMEPAGE_HERO" | "DEALS";
  priority?: number;
};

type FeaturedSectionUpdateInput = {
  title?: string;
  type?: "EXPERT_PICKS" | "HOMEPAGE_HERO" | "DEALS";
  priority?: number;
};

export class FeaturedSectionService {
  constructor(private repository: FeaturedSectionRepository) {}

  async listFeaturedSections() {
    return this.repository.list();
  }

  async getFeaturedSectionById(id: string) {
    const section = await this.repository.getById(id);
    if (!section) {
      throw new NotFoundError("Featured section not found");
    }
    return section;
  }

  async createFeaturedSection(data: FeaturedSectionCreateInput) {
    const createData: Prisma.FeaturedSectionCreateInput = {
      title: data.title.trim(),
      type: data.type,
      priority: data.priority ?? 0,
    };

    return this.repository.create(createData);
  }

  async updateFeaturedSection(id: string, data: FeaturedSectionUpdateInput) {
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

  async deleteFeaturedSection(id: string) {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new NotFoundError("Featured section not found");
    }

    const productCount = await this.repository.countFeaturedProducts(id);
    if (productCount > 0) {
      throw new ValidationError(
        `Cannot delete section: ${productCount} product(s) are still linked. Remove products from this section first.`,
      );
    }

    return this.repository.delete(id);
  }
}
