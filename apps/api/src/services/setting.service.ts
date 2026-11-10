import { INDIAN_STATES_AND_CODES } from "@repo/types";
import { NotFoundError, ValidationError } from "../lib/error.js";
import {
  ALL_STORE_SETTING_KEYS,
  SHIPPING_FEE_KEY,
  SUPPLIER_KEYS,
  buildSupplier,
  invalidateStoreSettingsCache,
  parseShippingFee,
  type SupplierDetails,
} from "../lib/storeSettings.js";
import { SettingRepository } from "../repositories/setting.repository.js";
import type { SettingRecord } from "../lib/mappers/setting.mapper.js";

const DEFAULT_WHATSAPP_NUMBER = "+919876543210";
const DEFAULT_WHATSAPP_MESSAGE =
  "Hello! I would like to know more about Pinak products.";
const DEFAULT_SUPPORT_EMAIL = "support@pinak.com";
const DEFAULT_SUPPORT_PHONE = "+919876543210";

const stateCodeFor = (state: string) =>
  INDIAN_STATES_AND_CODES[state.trim().toUpperCase()];

export class SettingService {
  constructor(private repo: SettingRepository) {}

  async getPublicSettings(group?: string): Promise<Record<string, string>> {
    const settings = await this.repo.getPublicSettings(group);
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async getWhatsAppContact(): Promise<{
    whatsappNumber: string;
    defaultMessage: string;
    supportEmail: string;
    supportPhone: string;
  }> {
    const settings = await this.repo.getByKeys([
      "WHATSAPP_NUMBER",
      "WHATSAPP_DEFAULT_MESSAGE",
      "SUPPORT_EMAIL",
      "SUPPORT_PHONE",
    ]);

    const map = new Map<string, string>();
    for (const s of settings) {
      map.set(s.key, s.value);
    }

    return {
      whatsappNumber:
        map.get("WHATSAPP_NUMBER") ||
        process.env.WHATSAPP_NUMBER ||
        DEFAULT_WHATSAPP_NUMBER,
      defaultMessage:
        map.get("WHATSAPP_DEFAULT_MESSAGE") ||
        process.env.WHATSAPP_DEFAULT_MESSAGE ||
        DEFAULT_WHATSAPP_MESSAGE,
      supportEmail:
        map.get("SUPPORT_EMAIL") ||
        process.env.SUPPORT_EMAIL ||
        DEFAULT_SUPPORT_EMAIL,
      supportPhone:
        map.get("SUPPORT_PHONE") ||
        process.env.SUPPORT_PHONE ||
        DEFAULT_SUPPORT_PHONE,
    };
  }

  async getByKey(
    key: string,
    onlyPublic = true,
  ): Promise<{ key: string; value: string }> {
    const setting = await this.repo.getByKey(key);
    if (!setting) {
      throw new NotFoundError(`Setting '${key}' not found`);
    }

    if (onlyPublic && !setting.isPublic) {
      throw new NotFoundError(`Setting '${key}' not found`);
    }

    return {
      key: setting.key,
      value: setting.value,
    };
  }

  async listAdmin(group?: string): Promise<SettingRecord[]> {
    return this.repo.getAll(group);
  }

  async updateSettings(
    entries: Record<string, string>,
  ): Promise<Record<string, string>> {
    const updated = await this.repo.upsertMany(entries);
    const result: Record<string, string> = {};
    for (const s of updated) {
      result[s.key] = s.value;
    }
    return result;
  }

  async setSetting(
    key: string,
    data: {
      value: string;
      group?: string;
      description?: string | null;
      isPublic?: boolean;
    },
  ): Promise<SettingRecord> {
    return this.repo.upsert(key, data);
  }

  // ── Shipping & supplier (admin-editable store settings) ───────────────

  private async loadStoreSettingsMap(): Promise<Map<string, string>> {
    const rows = await this.repo.getByKeys(ALL_STORE_SETTING_KEYS);
    return new Map(rows.map((r) => [r.key, r.value]));
  }

  async getShippingConfig(): Promise<{ shippingFee: number }> {
    return { shippingFee: parseShippingFee(await this.loadStoreSettingsMap()) };
  }

  async updateShippingConfig(
    shippingFee: number,
  ): Promise<{ shippingFee: number }> {
    await this.repo.upsert(SHIPPING_FEE_KEY, {
      value: String(shippingFee),
      group: "shipping",
      description:
        "Flat shipping charge in paise for orders that need shipping",
      isPublic: true,
    });
    invalidateStoreSettingsCache();
    return { shippingFee };
  }

  async getSupplierDetails(): Promise<SupplierDetails> {
    return buildSupplier(await this.loadStoreSettingsMap(), stateCodeFor);
  }

  async updateSupplierDetails(
    input: Omit<SupplierDetails, "brandName" | "stateCode">,
  ): Promise<SupplierDetails> {
    const stateCode = stateCodeFor(input.state);
    if (!stateCode) {
      throw new ValidationError(
        "Must be a valid Indian state or union territory",
      );
    }
    // GSTIN begins with the 2-digit code of the registered state; a mismatch would
    // print contradictory details on every invoice and mis-split CGST/SGST vs IGST.
    if (input.gstin.slice(0, 2) !== stateCode) {
      throw new ValidationError(
        `GSTIN must start with the state code ${stateCode} for ${input.state}`,
      );
    }

    const values: Record<string, string> = {
      [SUPPLIER_KEYS.companyName]: input.companyName,
      [SUPPLIER_KEYS.gstin]: input.gstin,
      [SUPPLIER_KEYS.pan]: input.pan,
      [SUPPLIER_KEYS.state]: input.state,
      [SUPPLIER_KEYS.addressLine1]: input.addressLine1,
      [SUPPLIER_KEYS.addressLine2]: input.addressLine2,
      [SUPPLIER_KEYS.city]: input.city,
      [SUPPLIER_KEYS.pincode]: input.pincode,
      [SUPPLIER_KEYS.email]: input.email,
      [SUPPLIER_KEYS.phone]: input.phone,
    };
    for (const [key, value] of Object.entries(values)) {
      await this.repo.upsert(key, {
        value,
        group: "supplier",
        description: "Supplier details printed on tax invoices",
        isPublic: false,
      });
    }
    invalidateStoreSettingsCache();
    return this.getSupplierDetails();
  }
}
