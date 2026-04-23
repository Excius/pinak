import { PrismaClient, Prisma } from "../generated/prisma/client.js";
import { NotFoundError } from "../lib/error.js";

export class CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * List all top-level categories (no parent) or children of a given parentId.
   */
  async list(parentId?: string | null, includeChildren = true) {
    const include: Prisma.CategoryInclude = {
      categoryImages: {
        where: { isDeleted: false },
        orderBy: [
          { isPrimary: "desc" as Prisma.SortOrder },
          { sortOrder: "asc" as Prisma.SortOrder },
        ],
        omit: {
          createdAt: true,
          updatedAt: true,
          isDeleted: true,
          id: true,
          categoryId: true,
        },
      },
    };

    if (includeChildren) {
      include.children = {
        orderBy: { name: "asc" as Prisma.SortOrder },
        omit: { createdAt: true, updatedAt: true },
        include: {
          categoryImages: {
            where: { isDeleted: false },
            orderBy: [
              { isPrimary: "desc" as Prisma.SortOrder },
              { sortOrder: "asc" as Prisma.SortOrder },
            ],
            omit: {
              createdAt: true,
              updatedAt: true,
              isDeleted: true,
              id: true,
              categoryId: true,
            },
          },
        },
      };
    }

    try {
      return await this.prisma.category.findMany({
        where: parentId !== undefined ? { parentId } : {},
        orderBy: { name: "asc" as Prisma.SortOrder },
        include,
        omit: {
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (err: unknown) {
      // If CategoryImage table doesn't exist yet (P2021), fall back to returning
      // categories without the `categoryImages` relation to avoid crashing the API.
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2021") {
        const includeFallback: Prisma.CategoryInclude = {};
        if (includeChildren)
          includeFallback.children = {
            orderBy: { name: "asc" as Prisma.SortOrder },
            omit: { createdAt: true, updatedAt: true },
          };
        return this.prisma.category.findMany({
          where: parentId !== undefined ? { parentId } : {},
          orderBy: { name: "asc" as Prisma.SortOrder },
          include: includeFallback,
          omit: {
            createdAt: true,
            updatedAt: true,
          },
        });
      }
      throw err;
    }
  }

  /** Return only top-level categories (parentId === null) */
  async listTopCategories() {
    try {
      return await this.prisma.category.findMany({
        where: { parentId: null },
        orderBy: { name: "asc" as Prisma.SortOrder },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
        include: {
          categoryImages: {
            where: { isDeleted: false },
            orderBy: [
              { isPrimary: "desc" as Prisma.SortOrder },
              { sortOrder: "asc" as Prisma.SortOrder },
            ],
            omit: {
              createdAt: true,
              updatedAt: true,
              isDeleted: true,
              id: true,
              categoryId: true,
            },
          },
        },
      });
    } catch (err: unknown) {
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2021") {
        // fallback: return top-level categories without images
        return this.prisma.category.findMany({
          where: { parentId: null },
          orderBy: { name: "asc" as Prisma.SortOrder },
          omit: {
            createdAt: true,
            updatedAt: true,
          },
        });
      }
      throw err;
    }
  }

  /** Admin: return top-level categories with full details (children + images) */
  async listTopAdmin() {
    try {
      return await this.prisma.category.findMany({
        where: { parentId: null },
        orderBy: { name: "asc" as Prisma.SortOrder },
        include: {
          children: {
            orderBy: { name: "asc" as Prisma.SortOrder },
            include: {
              categoryImages: {
                where: { isDeleted: false },
                orderBy: [
                  { isPrimary: "desc" as Prisma.SortOrder },
                  { sortOrder: "asc" as Prisma.SortOrder },
                ],
              },
            },
          },
          categoryImages: {
            where: { isDeleted: false },
            orderBy: [
              { isPrimary: "desc" as Prisma.SortOrder },
              { sortOrder: "asc" as Prisma.SortOrder },
            ],
          },
        },
      });
    } catch (err: unknown) {
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2021") {
        return this.prisma.category.findMany({
          where: { parentId: null },
          orderBy: { name: "asc" as Prisma.SortOrder },
          include: {
            children: { orderBy: { name: "asc" as Prisma.SortOrder } },
          },
        });
      }
      throw err;
    }
  }

  /** Admin list — includes images for management UI */
  listAdmin(parentId?: string | null) {
    const include: Prisma.CategoryInclude = {
      children: {
        orderBy: { name: "asc" as Prisma.SortOrder },
        include: {
          categoryImages: {
            where: { isDeleted: false },
            orderBy: [
              { isPrimary: "desc" as Prisma.SortOrder },
              { sortOrder: "asc" as Prisma.SortOrder },
            ],
          },
        },
      },
      categoryImages: {
        where: { isDeleted: false },
        orderBy: [
          { isPrimary: "desc" as Prisma.SortOrder },
          { sortOrder: "asc" as Prisma.SortOrder },
        ],
      },
    };

    try {
      return this.prisma.category.findMany({
        where: parentId !== undefined ? { parentId } : {},
        orderBy: { name: "asc" as Prisma.SortOrder },
        include,
      });
    } catch (err: unknown) {
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2021") {
        return this.prisma.category.findMany({
          where: parentId !== undefined ? { parentId } : {},
          orderBy: { name: "asc" as Prisma.SortOrder },
          include: {
            children: { orderBy: { name: "asc" as Prisma.SortOrder } },
          },
        });
      }
      throw err;
    }
  }

  /**
   * Fetch the full category tree (roots + nested children) in one go.
   * Returns only root-level categories; each has `children` nested recursively.
   * For very large trees a recursive CTE would be more efficient, but this
   * works well for typical e-commerce category counts (<1 000 nodes).
   */
  async getTree() {
    // Fetch all categories flat
    let all = null;
    try {
      all = await this.prisma.category.findMany({
        orderBy: { name: "asc" as Prisma.SortOrder },
        include: {
          categoryImages: {
            where: { isDeleted: false },
            orderBy: [
              { isPrimary: "desc" as Prisma.SortOrder },
              { sortOrder: "asc" as Prisma.SortOrder },
            ],
            omit: {
              createdAt: true,
              updatedAt: true,
              id: true,
              isDeleted: true,
              categoryId: true,
            },
          },
        },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (err: unknown) {
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2021") {
        all = await this.prisma.category.findMany({
          orderBy: { name: "asc" as Prisma.SortOrder },
          omit: {
            createdAt: true,
            updatedAt: true,
          },
        });
      } else {
        throw err;
      }
    }

    type CategoryNode = (typeof all)[0] & { children: CategoryNode[] };

    const map = new Map<string, CategoryNode>();
    for (const c of all) {
      map.set(c.id, { ...c, children: [] });
    }

    const roots: CategoryNode[] = [];
    for (const node of map.values()) {
      if (node.parentId) {
        map.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /** Admin tree — include images on nodes for management UI */
  async getTreeAdmin() {
    let all = null;
    try {
      all = await this.prisma.category.findMany({
        orderBy: { name: "asc" as Prisma.SortOrder },
        include: {
          categoryImages: {
            where: { isDeleted: false },
            orderBy: [
              { isPrimary: "desc" as Prisma.SortOrder },
              { sortOrder: "asc" as Prisma.SortOrder },
            ],
          },
        },
      });
    } catch (err: unknown) {
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2021") {
        all = await this.prisma.category.findMany({
          orderBy: { name: "asc" as Prisma.SortOrder },
        });
      } else {
        throw err;
      }
    }

    type CategoryNode = (typeof all)[0] & { children: CategoryNode[] };

    const map = new Map<string, CategoryNode>();
    for (const c of all) {
      map.set(c.id, { ...c, children: [] });
    }

    const roots: CategoryNode[] = [];
    for (const node of map.values()) {
      if (node.parentId) {
        map.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async getById(id: string) {
    try {
      return await this.prisma.category.findUnique({
        where: { id },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
        include: {
          parent: {
            omit: { createdAt: true, updatedAt: true },
          },
          children: {
            orderBy: { name: "asc" as Prisma.SortOrder },
            omit: { createdAt: true, updatedAt: true },
            include: {
              categoryImages: {
                where: { isDeleted: false },
                orderBy: [
                  { isPrimary: "desc" as Prisma.SortOrder },
                  { sortOrder: "asc" as Prisma.SortOrder },
                ],
                omit: {
                  createdAt: true,
                  updatedAt: true,
                  isDeleted: true,
                  id: true,
                  categoryId: true,
                },
              },
            },
          },
          categoryImages: {
            where: { isDeleted: false },
            orderBy: [
              { isPrimary: "desc" as Prisma.SortOrder },
              { sortOrder: "asc" as Prisma.SortOrder },
            ],
            omit: {
              id: true,
              categoryId: true,
              createdAt: true,
              updatedAt: true,
              isDeleted: true,
            },
          },
        },
      });
    } catch (err: unknown) {
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2021") {
        return this.prisma.category.findUnique({
          where: { id },
          omit: {
            createdAt: true,
            updatedAt: true,
          },
          include: {
            parent: {
              omit: { createdAt: true, updatedAt: true },
            },
            children: {
              orderBy: { name: "asc" as Prisma.SortOrder },
              omit: {
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        });
      }
      throw err;
    }
  }

  async getBySlug(slug: string) {
    try {
      return await this.prisma.category.findUnique({
        where: { slug },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
        include: {
          parent: {
            omit: { createdAt: true, updatedAt: true },
          },
          children: {
            orderBy: { name: "asc" as Prisma.SortOrder },
            omit: { createdAt: true, updatedAt: true },
            include: {
              categoryImages: {
                where: { isDeleted: false },
                orderBy: [
                  { isPrimary: "desc" as Prisma.SortOrder },
                  { sortOrder: "asc" as Prisma.SortOrder },
                ],
                omit: {
                  createdAt: true,
                  updatedAt: true,
                  isDeleted: true,
                  id: true,
                  categoryId: true,
                },
              },
            },
          },
          categoryImages: {
            where: { isDeleted: false },
            orderBy: [
              { isPrimary: "desc" as Prisma.SortOrder },
              { sortOrder: "asc" as Prisma.SortOrder },
            ],
            omit: {
              id: true,
              categoryId: true,
              createdAt: true,
              updatedAt: true,
              isDeleted: true,
            },
          },
        },
      });
    } catch (err: unknown) {
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2021") {
        return this.prisma.category.findUnique({
          where: { slug },
          omit: {
            createdAt: true,
            updatedAt: true,
          },
          include: {
            parent: {
              omit: { createdAt: true, updatedAt: true },
            },
            children: {
              orderBy: { name: "asc" as Prisma.SortOrder },
              omit: { createdAt: true, updatedAt: true },
            },
          },
        });
      }
      throw err;
    }
  }

  /** Admin fetch with full content (includes images) */
  async getByIdAdmin(id: string) {
    try {
      return await this.prisma.category.findUnique({
        where: { id },
        include: {
          parent: true,
          children: {
            orderBy: { name: "asc" as Prisma.SortOrder },
            include: {
              categoryImages: {
                where: { isDeleted: false },
                orderBy: [
                  { isPrimary: "desc" as Prisma.SortOrder },
                  { sortOrder: "asc" as Prisma.SortOrder },
                ],
              },
            },
          },
          categoryImages: {
            where: { isDeleted: false },
            orderBy: [
              { isPrimary: "desc" as Prisma.SortOrder },
              { sortOrder: "asc" as Prisma.SortOrder },
            ],
          },
        },
      });
    } catch (err: unknown) {
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2021") {
        return this.prisma.category.findUnique({
          where: { id },
          include: {
            parent: true,
            children: { orderBy: { name: "asc" as Prisma.SortOrder } },
          },
        });
      }
      throw err;
    }
  }

  async getBySlugAdmin(slug: string) {
    try {
      return await this.prisma.category.findUnique({
        where: { slug },
        include: {
          parent: true,
          children: {
            orderBy: { name: "asc" as Prisma.SortOrder },
            include: {
              categoryImages: {
                where: { isDeleted: false },
                orderBy: [
                  { isPrimary: "desc" as Prisma.SortOrder },
                  { sortOrder: "asc" as Prisma.SortOrder },
                ],
              },
            },
          },
          categoryImages: {
            where: { isDeleted: false },
            orderBy: [
              { isPrimary: "desc" as Prisma.SortOrder },
              { sortOrder: "asc" as Prisma.SortOrder },
            ],
          },
        },
      });
    } catch (err: unknown) {
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2021") {
        return this.prisma.category.findUnique({
          where: { slug },
          include: {
            parent: true,
            children: { orderBy: { name: "asc" as Prisma.SortOrder } },
          },
        });
      }
      throw err;
    }
  }

  /** Check for name/slug conflicts, optionally excluding one record (for updates). */
  findConflict(slug: string, excludeId?: string) {
    return this.prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  create(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({ data });
  }

  update(id: string, data: Prisma.CategoryUpdateInput) {
    return this.prisma.category.update({ where: { id }, data });
  }

  /** Hard-delete — caller must confirm no products are linked. */
  delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  countProducts(categoryId: string) {
    return this.prisma.productCategory.count({ where: { categoryId } });
  }

  countChildren(parentId: string) {
    return this.prisma.category.count({ where: { parentId } });
  }

  /**
   * Walks the parent chain starting from `startId` up to the root.
   * Returns true if `targetId` is found in the ancestor chain, which
   * means setting `targetId` as a parent of `startId` would create a cycle.
   */
  async wouldCreateCycle(startId: string, targetId: string): Promise<boolean> {
    let currentId: string | null = targetId;
    while (currentId) {
      if (currentId === startId) return true;
      const node: { parentId: string | null } | null =
        await this.prisma.category.findUnique({
          where: { id: currentId },
          select: { parentId: true },
        });
      currentId = node?.parentId ?? null;
    }
    return false;
  }

  // Category image management
  addCategoryImage(categoryId: string, data: Prisma.CategoryImageCreateInput) {
    if (data.isPrimary) {
      return this.prisma.$transaction(async (tx) => {
        await tx.categoryImage.updateMany({
          where: { categoryId, isPrimary: true },
          data: { isPrimary: false },
        });
        return tx.categoryImage.create({
          data: { ...data, category: { connect: { id: categoryId } } },
        });
      });
    }

    return this.prisma.categoryImage.create({
      data: { ...data, category: { connect: { id: categoryId } } },
    });
  }

  setPrimaryImage(imageId: string) {
    return this.prisma.$transaction(async (tx) => {
      const image = await tx.categoryImage.findUnique({
        where: { id: imageId },
        include: { category: true },
      });

      if (!image) {
        throw new NotFoundError("Image not found");
      }

      await tx.categoryImage.updateMany({
        where: { categoryId: image.categoryId, isPrimary: true },
        data: { isPrimary: false },
      });

      return tx.categoryImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    });
  }

  softDeleteImage(id: string) {
    return this.prisma.categoryImage.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  restoreImage(id: string) {
    return this.prisma.categoryImage.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  hardDeleteImage(id: string) {
    return this.prisma.categoryImage.delete({ where: { id } });
  }

  getCategoryImageById(id: string) {
    return this.prisma.categoryImage.findUnique({ where: { id } });
  }
}
