import { Prisma } from "../generated/prisma/client.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import { isPrismaP2002 } from "../lib/prisma-errors.js";
import { OptionRepository } from "../repositories/option.repository.js";

export class OptionService {
  constructor(private repo: OptionRepository) {}

  listOptions() {
    return this.repo.listOptions();
  }

  getOptionById(id: string) {
    return this.repo.getOptionById(id);
  }

  async createOption(data: Prisma.OptionCreateInput) {
    const exists = await this.repo.findByName(data.name as string);
    if (exists)
      throw new ValidationError("Option with this name already exists");
    try {
      return await this.repo.createOption(data);
    } catch (err) {
      if (isPrismaP2002(err))
        throw new ValidationError("Option with this name already exists");
      throw err;
    }
  }

  async updateOption(id: string, data: Prisma.OptionUpdateInput) {
    const existing = await this.getOptionById(id);
    if (!existing) throw new NotFoundError("Option not found");
    return this.repo.updateOption(id, data);
  }

  async deleteOption(id: string) {
    const refs = await this.repo.countOptionValues(id);
    if (refs > 0)
      throw new ValidationError(
        "Cannot delete option while it still has values",
      );
    return this.repo.deleteOption(id);
  }

  // OptionValue helpers
  async createOptionValue(optionId: string, value: string) {
    const option = await this.repo.getOptionById(optionId);
    if (!option) throw new NotFoundError("Option not found");
    const exists = await this.repo.findOptionValue(optionId, value);
    if (exists) throw new ValidationError("Option value already exists");
    try {
      return await this.repo.createOptionValue(optionId, value);
    } catch (err) {
      if (isPrismaP2002(err))
        throw new ValidationError("Option value already exists");
      throw err;
    }
  }

  async updateOptionValue(id: string, data: Prisma.OptionValueUpdateInput) {
    const existing = await this.repo.getOptionValueById(id);
    if (!existing) throw new NotFoundError("OptionValue not found");
    return this.repo.updateOptionValue(id, data);
  }

  async deleteOptionValue(id: string) {
    const refs = await this.repo.countVariantOptionValueRefs(id);
    if (refs > 0)
      throw new ValidationError(
        "Cannot delete option value while variants reference it",
      );
    return this.repo.deleteOptionValue(id);
  }
}
