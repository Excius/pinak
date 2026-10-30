import { NotFoundError } from "../lib/error.js";
import { SettingRepository } from "../repositories/setting.repository.js";
import type { SettingRecord } from "../lib/mappers/setting.mapper.js";

const DEFAULT_WHATSAPP_NUMBER = "+919876543210";
const DEFAULT_WHATSAPP_MESSAGE = "Hello! I would like to know more about Pinak products.";
const DEFAULT_SUPPORT_EMAIL = "support@pinak.com";
const DEFAULT_SUPPORT_PHONE = "+919876543210";

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

  async getByKey(key: string, onlyPublic = true): Promise<{ key: string; value: string }> {
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
}
