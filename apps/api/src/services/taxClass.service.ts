import { Prisma } from "../generated/prisma/client.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import { isPrismaP2002 } from "../lib/prisma-errors.js";
import { TaxClassRepository } from "../repositories/taxClass.repository.js";

export class TaxClassService {
  constructor(private repo: TaxClassRepository) {}

  listTaxClasses() {
    return this.repo.list();
  }

  getTaxClassById(id: string) {
    return this.repo.getById(id);
  }

  async createTaxClass(data: Prisma.TaxClassCreateInput) {
    const exists = await this.repo.findByName(data.name);
    if (exists)
      throw new ValidationError("Tax class with this name already exists");
    try {
      return await this.repo.create(data);
    } catch (err) {
      if (isPrismaP2002(err))
        throw new ValidationError("Tax class with this name already exists");
      throw err;
    }
  }

  async updateTaxClass(id: string, data: Prisma.TaxClassUpdateInput) {
    const existing = await this.getTaxClassById(id);
    if (!existing) throw new NotFoundError("TaxClass not found");
    return this.repo.update(id, data);
  }

  async deleteTaxClass(id: string) {
    const referenced = await this.repo.countProductsByTaxClass(id);
    if (referenced > 0)
      throw new ValidationError(
        "Cannot delete tax class while products reference it",
      );
    return this.repo.delete(id);
  }
}
