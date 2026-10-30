import { Prisma } from "../generated/prisma/client.js";
import { NotFoundError, ValidationError, ConflictError } from "../lib/error.js";
import { PageRepository } from "../repositories/page.repository.js";
import { PageRecord } from "../lib/mappers/page.mapper.js";
import { PaginationMeta } from "../lib/mappers/store.mapper.js";

export type AdminPageQuery = {
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "title" | "slug" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type CreatePageInput = {
  title: string;
  slug: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isActive?: boolean;
};

export type UpdatePageInput = Partial<CreatePageInput>;

export class PageService {
  constructor(private repo: PageRepository) {}

  async listPublic(): Promise<PageRecord[]> {
    return this.repo.listPublicActive();
  }

  async getBySlug(slug: string): Promise<PageRecord> {
    const page = await this.repo.getBySlug(slug, true);
    if (!page) {
      throw new NotFoundError(`Page "${slug}" not found`);
    }
    return page;
  }

  async listAdmin(query: AdminPageQuery): Promise<{
    pages: PageRecord[];
    pagination: PaginationMeta;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const where: Prisma.PageWhereInput = {};

    if (!query.includeDeleted) {
      where.isDeleted = false;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search && query.search.trim().length > 0) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    const sortBy = query.sortBy ?? "createdAt";
    const orderBy: Prisma.PageOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const skip = (page - 1) * limit;
    const [pages, total] = await Promise.all([
      this.repo.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.repo.count(where),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      pages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getByIdAdmin(id: string): Promise<PageRecord> {
    const page = await this.repo.getById(id, true);
    if (!page) {
      throw new NotFoundError("Page not found");
    }
    return page;
  }

  async createPage(input: CreatePageInput): Promise<PageRecord> {
    const slug = input.slug.trim().toLowerCase();
    const existing = await this.repo.getBySlug(slug, false);
    if (existing) {
      throw new ConflictError(`Page with slug "${slug}" already exists`);
    }

    const data: Prisma.PageCreateInput = {
      title: input.title.trim(),
      slug,
      content: input.content,
      metaTitle: input.metaTitle ? input.metaTitle.trim() : null,
      metaDescription: input.metaDescription ? input.metaDescription.trim() : null,
      isActive: input.isActive !== undefined ? input.isActive : true,
    };

    return this.repo.create(data);
  }

  async updatePage(id: string, input: UpdatePageInput): Promise<PageRecord> {
    const existing = await this.repo.getById(id, true);
    if (!existing) {
      throw new NotFoundError("Page not found");
    }

    if (input.slug) {
      const newSlug = input.slug.trim().toLowerCase();
      if (newSlug !== existing.slug) {
        const slugExists = await this.repo.getBySlug(newSlug, false);
        if (slugExists && slugExists.id !== id) {
          throw new ConflictError(`Page with slug "${newSlug}" already exists`);
        }
      }
    }

    const data: Prisma.PageUpdateInput = {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.slug !== undefined && { slug: input.slug.trim().toLowerCase() }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.metaTitle !== undefined && {
        metaTitle: input.metaTitle ? input.metaTitle.trim() : null,
      }),
      ...(input.metaDescription !== undefined && {
        metaDescription: input.metaDescription ? input.metaDescription.trim() : null,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    };

    return this.repo.update(id, data);
  }

  async deletePage(id: string): Promise<void> {
    const existing = await this.repo.getById(id, false);
    if (!existing) {
      throw new NotFoundError("Page not found");
    }
    await this.repo.softDelete(id);
  }

  async restorePage(id: string): Promise<PageRecord> {
    const existing = await this.repo.getById(id, true);
    if (!existing) {
      throw new NotFoundError("Page not found");
    }
    return this.repo.restore(id);
  }
}
