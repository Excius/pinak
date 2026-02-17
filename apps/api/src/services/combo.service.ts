import { Prisma } from "../generated/prisma/client.js";
import { ComboRepository } from "../repositories/combo.repositoy.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import logger from "../lib/logger.js";

// DTOs used by service layer (received from controller / request body)
type ComboKitItemDTO = { productVariantId: string; quantity: number };
type ComboKitCreateDTO = {
  name: string;
  slug?: string | null;
  description?: string | null;
  audience?: string | null;
  price: number;
  isActive?: boolean;
  items?: ComboKitItemDTO[];
};
type ComboKitUpdateDTO = Partial<Pick<ComboKitCreateDTO, "name" | "slug" | "description" | "audience" | "price" | "isActive">>;

export class ComboService {
  constructor(private comboRepository: ComboRepository) {}

  async getComboKits(pagination: { page: number; limit: number; isActive?: boolean }) {
    return this.comboRepository.getComboKits(pagination);
  }

  async getComboKitBySlug(slug: string) {
    return this.comboRepository.getComboKitBySlug(slug);
  }

  // Admin methods
  async createComboKit(data: ComboKitCreateDTO) {
    // Normalize and validate incoming DTO
    const name = data.name?.trim();
    const slug = data.slug ? data.slug.trim().toLowerCase() : undefined;
    const description = data.description ?? null;
    const audience = data.audience ? data.audience.trim() : null;
    const price = data.price;
    const isActive = data.isActive ?? true;
    const items = data.items;

    if (!name) throw new ValidationError("Name is required");

    // Create a deterministic slug when none provided
    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^\n\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // validate slug uniqueness
    const existing = await this.comboRepository.getComboKitBySlug(finalSlug);
    if (existing) throw new ValidationError("ComboKit with this slug already exists");

    // validate items (if provided)
    if (items && items.length > 0) {
      for (const it of items) {
        const pv = await this.comboRepository.prismaClient.productVariant.findUnique({ where: { id: it.productVariantId } });
        if (!pv) throw new ValidationError(`Product variant ${it.productVariantId} not found`);
        if (it.quantity <= 0) throw new ValidationError(`Quantity must be >= 1 for variant ${it.productVariantId}`);
      }
    }

    // Build Prisma input
    const prismaData: Prisma.ComboKitCreateInput = {
      name: name as string,
      slug: finalSlug,
      description,
      audience,
      price: price as number,
      isActive,
      items:
        items && items.length > 0
          ? { create: items.map((it) => ({ productVariant: { connect: { id: it.productVariantId } }, quantity: it.quantity })) }
          : undefined,
    };

    return this.comboRepository.createComboKit(prismaData);
  }

  async updateComboKit(id: string, data: ComboKitUpdateDTO) {
    const existing = await this.comboRepository.getComboKitById(id);
    if (!existing) throw new NotFoundError("ComboKit not found");

    const updateData: Prisma.ComboKitUpdateInput = {};

    if (data.name !== undefined) updateData.name = (data.name as string).trim();
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.price !== undefined) updateData.price = data.price as number;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.slug !== undefined) {
      const newSlug = data.slug ? data.slug.trim().toLowerCase() : undefined;
      if (newSlug && newSlug !== existing.slug) {
        const slugExists = await this.comboRepository.getComboKitBySlug(newSlug);
        if (slugExists) throw new ValidationError("ComboKit with this slug already exists");
      }
      if (newSlug !== undefined) updateData.slug = newSlug;
    }

    if (data.audience !== undefined) {
      updateData.audience = data.audience ?? null;
    }

    return this.comboRepository.updateComboKit(id, updateData);
  }

  async addComboKitItem(comboKitId: string, data: ComboKitItemDTO) {
    const kit = await this.comboRepository.getComboKitById(comboKitId);
    if (!kit) throw new NotFoundError("ComboKit not found");

    // validate variant exists
    const pv = await this.comboRepository.prismaClient.productVariant.findUnique({ where: { id: data.productVariantId } });
    if (!pv) throw new ValidationError("Product variant not found");

    // prevent duplicate
    const exists = kit.items.find((i) => i.productVariantId === data.productVariantId);
    if (exists) throw new ValidationError("Product variant already exists in this combo kit");

    const createInput: Prisma.ComboKitItemCreateInput = {
      productVariant: { connect: { id: data.productVariantId } },
      quantity: data.quantity,
      comboKit: { connect: { id: comboKitId } },
    };

    return this.comboRepository.addComboKitItem(comboKitId, createInput);
  }

  async removeComboKitItem(comboKitId: string, itemId: string) {
    const kit = await this.comboRepository.getComboKitById(comboKitId);
    if (!kit) throw new NotFoundError("ComboKit not found");

    const item = kit.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundError("ComboKit item not found");

    return this.comboRepository.removeComboKitItem(itemId);
  }

  async softDeleteComboKit(id: string) {
    return this.comboRepository.softDeleteComboKit(id);
  }

  async restoreComboKit(id: string) {
    return this.comboRepository.restoreComboKit(id);
  }

  async hardDeleteComboKit(id: string) {
    const kit = await this.comboRepository.getComboKitById(id);
    if (!kit) throw new NotFoundError("ComboKit not found");

    const { cartCount, orderCount } = await this.comboRepository.countComboKitReferences(id);
    const blockers: string[] = [];
    if (cartCount) blockers.push("carts");
    if (orderCount) blockers.push("orders");

    if (blockers.length > 0) {
      logger.warn(`Preventing hard-delete for combo kit ${id} due to dependencies: ${blockers.join(", ")}`);
      throw new ValidationError(
        `Cannot hard-delete combo kit: dependent resources exist (${blockers.join(", ")}). Delete or detach those resources first.`,
      );
    }

    return this.comboRepository.hardDeleteComboKit(id);
  }
}
