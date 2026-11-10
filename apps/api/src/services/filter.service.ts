import { Prisma } from "../generated/prisma/client.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import { isPrismaP2002 } from "../lib/prisma-errors.js";
import { FilterRepository } from "../repositories/filter.repository.js";

export class FilterService {
  constructor(private repo: FilterRepository) {}

  // FilterGroup CRUD
  listGroups(activeOnly = false) {
    return this.repo.listGroups(activeOnly);
  }

  getGroupById(id: string, activeOnly = false) {
    return this.repo.getGroupById(id, activeOnly);
  }

  async createGroup(data: Prisma.FilterGroupCreateInput) {
    const exists = await this.repo.findGroupByName(data.name);
    if (exists)
      throw new ValidationError("Filter group with this name already exists");
    try {
      return await this.repo.createGroup(data);
    } catch (err) {
      if (isPrismaP2002(err))
        throw new ValidationError("Filter group with this name already exists");
      throw err;
    }
  }

  async updateGroup(id: string, data: Prisma.FilterGroupUpdateInput) {
    const existing = await this.getGroupById(id);
    if (!existing) throw new NotFoundError("FilterGroup not found");
    return this.repo.updateGroup(id, data);
  }

  async deleteGroup(id: string) {
    const refs = await this.repo.countFilterValues(id);
    if (refs > 0)
      throw new ValidationError(
        "Cannot delete filter group while it still has values",
      );
    return this.repo.deleteGroup(id);
  }

  // FilterValue CRUD
  async createValue(
    groupId: string,
    data: { name: string; slug?: string; sortOrder?: number },
  ) {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw new NotFoundError("FilterGroup not found");
    const slug = data.slug ?? data.name.toLowerCase().replace(/\s+/g, "-");
    const exists = await this.repo.findFilterValueBySlug(groupId, slug);
    if (exists)
      throw new ValidationError(
        "FilterValue with this slug already exists in the group",
      );
    try {
      return await this.repo.createFilterValue(groupId, {
        name: data.name,
        slug,
        sortOrder: data.sortOrder ?? 0,
      });
    } catch (err) {
      if (isPrismaP2002(err))
        throw new ValidationError(
          "FilterValue with this slug already exists in the group",
        );
      throw err;
    }
  }

  async updateValue(id: string, data: Prisma.FilterValueUpdateInput) {
    const existing = await this.repo.getFilterValueById(id);
    if (!existing) throw new NotFoundError("FilterValue not found");
    return this.repo.updateFilterValue(id, data);
  }

  async deleteValue(id: string) {
    const refs = await this.repo.countProductFilterRefs(id);
    if (refs > 0)
      throw new ValidationError(
        "Cannot delete filter value while products reference it",
      );
    return this.repo.deleteFilterValue(id);
  }

  // Attach a filter value to a variant (each variant has its own filters)
  async addFilterToVariant(variantId: string, filterValueId: string) {
    const variant = await this.repo.getVariantById(variantId);
    if (!variant) throw new NotFoundError("Product variant not found");
    const fv = await this.repo.getFilterValueById(filterValueId);
    if (!fv) throw new NotFoundError("Filter value not found");

    const exists = await this.repo.existsVariantFilterRef(
      variantId,
      filterValueId,
    );
    if (exists)
      throw new ValidationError("Filter value already attached to variant");

    return this.repo.addFilterToVariant(
      variant.productId,
      variantId,
      filterValueId,
    );
  }

  async removeFilterFromVariant(variantId: string, filterValueId: string) {
    const variant = await this.repo.getVariantById(variantId);
    if (!variant) throw new NotFoundError("Product variant not found");
    return this.repo.removeFilterFromVariant(
      variant.productId,
      variantId,
      filterValueId,
    );
  }
}
