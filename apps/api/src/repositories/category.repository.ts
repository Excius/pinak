import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export class CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * List all top-level categories (no parent) or children of a given parentId.
   */
  list(parentId?: string | null) {
    return this.prisma.category.findMany({
      where: parentId !== undefined ? { parentId } : {},
      orderBy: { name: "asc" },
      include: {
        children: { orderBy: { name: "asc" } },
      },
    });
  }

  /**
   * Fetch the full category tree (roots + nested children) in one go.
   * Returns only root-level categories; each has `children` nested recursively.
   * For very large trees a recursive CTE would be more efficient, but this
   * works well for typical e-commerce category counts (<1 000 nodes).
   */
  async getTree() {
    // Fetch all categories flat
    const all = await this.prisma.category.findMany({
      orderBy: { name: "asc" },
    });

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

  getById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: { orderBy: { name: "asc" } } },
    });
  }

  getBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: { parent: true, children: { orderBy: { name: "asc" } } },
    });
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
      // eslint-disable-next-line no-await-in-loop
      const node: { parentId: string | null } | null =
        await this.prisma.category.findUnique({
          where: { id: currentId },
          select: { parentId: true },
        });
      currentId = node?.parentId ?? null;
    }
    return false;
  }
}
