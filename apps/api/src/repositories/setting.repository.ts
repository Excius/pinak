import { PrismaClient, Prisma } from "../generated/prisma/client.js";
import type { SettingRecord } from "../lib/mappers/setting.mapper.js";

export class SettingRepository {
  constructor(private prisma: PrismaClient) {}

  async getByKey(key: string): Promise<SettingRecord | null> {
    return this.prisma.setting.findUnique({
      where: { key },
    });
  }

  async getPublicSettings(group?: string): Promise<SettingRecord[]> {
    return this.prisma.setting.findMany({
      where: {
        isPublic: true,
        ...(group ? { group } : {}),
      },
      orderBy: { key: "asc" },
    });
  }

  async getByKeys(keys: string[]): Promise<SettingRecord[]> {
    return this.prisma.setting.findMany({
      where: {
        key: { in: keys },
      },
    });
  }

  async getAll(group?: string): Promise<SettingRecord[]> {
    return this.prisma.setting.findMany({
      where: group ? { group } : undefined,
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });
  }

  async upsert(
    key: string,
    data: {
      value: string;
      group?: string;
      description?: string | null;
      isPublic?: boolean;
    },
  ): Promise<SettingRecord> {
    return this.prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value: data.value,
        group: data.group ?? "general",
        description: data.description,
        isPublic: data.isPublic ?? true,
      },
      update: {
        value: data.value,
        ...(data.group !== undefined ? { group: data.group } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.isPublic !== undefined ? { isPublic: data.isPublic } : {}),
      },
    });
  }

  async upsertMany(
    entries: Record<string, string>,
  ): Promise<SettingRecord[]> {
    const keys = Object.keys(entries);
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const results: SettingRecord[] = [];
      for (const key of keys) {
        const updated = await tx.setting.upsert({
          where: { key },
          create: {
            key,
            value: entries[key] as string,
            group: "general",
            isPublic: true,
          },
          update: {
            value: entries[key] as string,
          },
        });
        results.push(updated);
      }
      return results;
    });
  }
}
