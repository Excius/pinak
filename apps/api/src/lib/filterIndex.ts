import type { Prisma, PrismaClient } from "../generated/prisma/client.js";

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Rebuilds a product's `ProductFilterValue` rows as the union of the filter values
 * attached to its non-deleted variants. Variants are the source of truth; the
 * product-level rows only exist so product listings can keep filtering cheaply.
 */
export async function syncProductFilterIndex(db: Db, productId: string) {
  const rows = await db.variantFilterValue.findMany({
    where: { variant: { productId, isDeleted: false } },
    select: { filterValueId: true },
    distinct: ["filterValueId"],
  });
  const wanted = rows.map((r) => r.filterValueId);

  await db.productFilterValue.deleteMany({
    where: { productId, filterValueId: { notIn: wanted } },
  });
  if (wanted.length > 0) {
    await db.productFilterValue.createMany({
      data: wanted.map((filterValueId) => ({ productId, filterValueId })),
      skipDuplicates: true,
    });
  }
}
