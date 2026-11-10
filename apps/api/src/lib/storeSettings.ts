import type { Prisma, PrismaClient } from "../generated/prisma/client.js";

/**
 * Admin-editable store settings that business code (cart, orders, invoices) depends on.
 * Stored in the generic `Setting` table; every value falls back to a safe default.
 */

type Db = PrismaClient | Prisma.TransactionClient;

export const SHIPPING_FEE_KEY = "SHIPPING_FEE";
/** ₹100 flat, in paise. Used when the setting is missing or invalid. */
export const DEFAULT_SHIPPING_FEE_PAISE = 10000;

export const SUPPLIER_KEYS = {
  companyName: "SUPPLIER_COMPANY_NAME",
  gstin: "SUPPLIER_GSTIN",
  pan: "SUPPLIER_PAN",
  state: "SUPPLIER_STATE",
  addressLine1: "SUPPLIER_ADDRESS_LINE1",
  addressLine2: "SUPPLIER_ADDRESS_LINE2",
  city: "SUPPLIER_CITY",
  pincode: "SUPPLIER_PINCODE",
  email: "SUPPLIER_EMAIL",
  phone: "SUPPLIER_PHONE",
} as const;

export type SupplierDetails = {
  companyName: string;
  brandName: string;
  gstin: string;
  pan: string;
  state: string;
  stateCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  email: string;
  phone: string;
};

export const DEFAULT_SUPPLIER: SupplierDetails = {
  companyName: "Pinak Beauty & Care Pvt. Ltd.",
  brandName: "Pinak",
  gstin: "27AAACP1234A1Z5",
  pan: "AAACP1234A",
  state: "Maharashtra",
  stateCode: "27",
  addressLine1: "Building A, Tech Park, BKC",
  addressLine2: "",
  city: "Mumbai",
  pincode: "400051",
  email: "support@pinak.com",
  phone: "+91-22-4000-1000",
};

export const ALL_STORE_SETTING_KEYS: string[] = [
  SHIPPING_FEE_KEY,
  ...Object.values(SUPPLIER_KEYS),
];

export function parseShippingFee(map: Map<string, string>): number {
  const raw = map.get(SHIPPING_FEE_KEY);
  if (raw === undefined || raw.trim() === "") return DEFAULT_SHIPPING_FEE_PAISE;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : DEFAULT_SHIPPING_FEE_PAISE;
}

export function buildSupplier(
  map: Map<string, string>,
  stateCodeFor: (state: string) => string | undefined,
): SupplierDetails {
  const pick = (key: string, fallback: string) => {
    const v = map.get(key);
    return v !== undefined && v.trim() !== "" ? v : fallback;
  };
  const state = pick(SUPPLIER_KEYS.state, DEFAULT_SUPPLIER.state);
  return {
    brandName: DEFAULT_SUPPLIER.brandName,
    companyName: pick(SUPPLIER_KEYS.companyName, DEFAULT_SUPPLIER.companyName),
    gstin: pick(SUPPLIER_KEYS.gstin, DEFAULT_SUPPLIER.gstin),
    pan: pick(SUPPLIER_KEYS.pan, DEFAULT_SUPPLIER.pan),
    state,
    stateCode: stateCodeFor(state) ?? DEFAULT_SUPPLIER.stateCode,
    addressLine1: pick(
      SUPPLIER_KEYS.addressLine1,
      DEFAULT_SUPPLIER.addressLine1,
    ),
    // line 2 may legitimately be empty
    addressLine2:
      map.get(SUPPLIER_KEYS.addressLine2) ?? DEFAULT_SUPPLIER.addressLine2,
    city: pick(SUPPLIER_KEYS.city, DEFAULT_SUPPLIER.city),
    pincode: pick(SUPPLIER_KEYS.pincode, DEFAULT_SUPPLIER.pincode),
    email: pick(SUPPLIER_KEYS.email, DEFAULT_SUPPLIER.email),
    phone: pick(SUPPLIER_KEYS.phone, DEFAULT_SUPPLIER.phone),
  };
}

// Short-lived cache: carts and invoices read these on every request.
const CACHE_TTL_MS = 10_000;
let cache: { at: number; map: Map<string, string> } | null = null;

/** Call after an admin saves these settings so this instance sees the change immediately. */
export function invalidateStoreSettingsCache() {
  cache = null;
}

async function loadMap(db: Db): Promise<Map<string, string>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.map;
  const rows = await db.setting.findMany({
    where: { key: { in: ALL_STORE_SETTING_KEYS } },
    select: { key: true, value: true },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  cache = { at: Date.now(), map };
  return map;
}

export async function getShippingFeePaise(db: Db): Promise<number> {
  return parseShippingFee(await loadMap(db));
}

export async function getSupplierDetails(
  db: Db,
  stateCodeFor: (state: string) => string | undefined,
): Promise<SupplierDetails> {
  return buildSupplier(await loadMap(db), stateCodeFor);
}
