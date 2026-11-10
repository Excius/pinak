import type { PrismaClient } from "../generated/prisma/client.js";
import logger from "./logger.js";

/**
 * Variant-level tax classes.
 *
 * A variant may override its product's tax class (`taxClassId`). Pricing code is synchronous
 * and variants are loaded by many different queries, so instead of requiring every query to
 * include the relation we resolve the id through this small in-memory map (the tax class
 * table has only a handful of rows). Money paths call `ensureTaxRates` first; display code
 * relies on the startup load + background refresh.
 */

export type TaxClassInfo = { id: string; name: string; rate: number };

let byId = new Map<string, TaxClassInfo>();
let loadedAt = 0;

export async function refreshTaxRates(db: PrismaClient): Promise<void> {
  const rows = await db.taxClass.findMany({
    select: { id: true, name: true, rate: true },
  });
  byId = new Map(rows.map((r) => [r.id, r]));
  loadedAt = Date.now();
}

/** Reloads the map if it is older than `maxAgeMs` (cheap: one tiny query). */
export async function ensureTaxRates(
  db: PrismaClient,
  maxAgeMs = 10_000,
): Promise<void> {
  if (Date.now() - loadedAt > maxAgeMs) {
    await refreshTaxRates(db);
  }
}

/** Keeps the map warm so display mappers rarely see a stale/empty map. */
export function startTaxRateRefresh(db: PrismaClient, everyMs = 30_000): void {
  refreshTaxRates(db).catch((err) =>
    logger.warn({ err }, "Initial tax rate load failed"),
  );
  setInterval(() => {
    refreshTaxRates(db).catch((err) =>
      logger.warn({ err }, "Tax rate refresh failed"),
    );
  }, everyMs).unref();
}

type VariantLike = {
  taxClassId?: string | null;
  taxClass?: { id?: string; name?: string; rate: number } | null;
  product?: { taxClass?: { name?: string; rate: number } | null } | null;
};

/** The tax class that applies to a variant: its own override, else its product's. */
export function variantTaxClass(
  variant: VariantLike | null | undefined,
  productTaxClass?: { name?: string; rate: number } | null,
): { name?: string; rate: number; overridden: boolean } | null {
  if (variant?.taxClassId) {
    const own = byId.get(variant.taxClassId) ?? variant.taxClass ?? null;
    if (own) return { name: own.name, rate: own.rate, overridden: true };
  }
  const inherited = productTaxClass ?? variant?.product?.taxClass ?? null;
  return inherited
    ? { name: inherited.name, rate: inherited.rate, overridden: false }
    : null;
}

/** Tax rate (percent) that applies to a variant. */
export function variantTaxRate(
  variant: VariantLike | null | undefined,
  productTaxClass?: { name?: string; rate: number } | null,
): number {
  return variantTaxClass(variant, productTaxClass)?.rate ?? 0;
}
