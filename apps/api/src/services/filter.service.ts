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

  // Tag/attach filter value to product
  async addFilterToProduct(productId: string, filterValueId: string) {
    const product = await this.repo.getProductById(productId);
    if (!product) throw new NotFoundError("Product not found");
    const fv = await this.repo.getFilterValueById(filterValueId);
    if (!fv) throw new NotFoundError("Filter value not found");

    const exists = await this.repo.existsProductFilterRef(
      productId,
      filterValueId,
    );
    if (exists)
      throw new ValidationError("Filter value already attached to product");

    return this.repo.addFilterToProduct(productId, filterValueId);
  }

  async removeFilterFromProduct(productId: string, filterValueId: string) {
    return this.repo.removeFilterFromProduct(productId, filterValueId);
  }
}
