import { Prisma } from "../generated/prisma/client.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import {
  LengthClassRepository,
  WeightClassRepository,
} from "../repositories/lengthWeight.repository.js";

import { isPrismaP2002 } from "../lib/prisma-errors.js";

export class LengthClassService {
  constructor(private repo: LengthClassRepository) {}

  list() {
    return this.repo.list();
  }

  getById(id: string) {
    return this.repo.getById(id);
  }

  async create(data: Prisma.LengthClassCreateInput) {
    const exists = await this.repo.findByName(data.name);
    if (exists)
      throw new ValidationError("Length class with this name already exists");
    try {
      return await this.repo.create(data);
    } catch (err) {
      if (isPrismaP2002(err))
        throw new ValidationError("Length class with this name already exists");
      throw err;
    }
  }

  async update(id: string, data: Prisma.LengthClassUpdateInput) {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError("LengthClass not found");
    return this.repo.update(id, data);
  }

  async delete(id: string) {
    const referenced = await this.repo.countProductsByLengthClass(id);
    if (referenced > 0)
      throw new ValidationError(
        "Cannot delete length class while products reference it",
      );
    return this.repo.delete(id);
  }
}

export class WeightClassService {
  constructor(private repo: WeightClassRepository) {}

  list() {
    return this.repo.list();
  }

  getById(id: string) {
    return this.repo.getById(id);
  }

  async create(data: Prisma.WeightClassCreateInput) {
    const exists = await this.repo.findByName(data.name);
    if (exists)
      throw new ValidationError("Weight class with this name already exists");
    try {
      return await this.repo.create(data);
    } catch (err) {
      if (isPrismaP2002(err))
        throw new ValidationError("Weight class with this name already exists");
      throw err;
    }
  }

  async update(id: string, data: Prisma.WeightClassUpdateInput) {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError("WeightClass not found");
    return this.repo.update(id, data);
  }

  async delete(id: string) {
    const referenced = await this.repo.countProductsByWeightClass(id);
    if (referenced > 0)
      throw new ValidationError(
        "Cannot delete weight class while products reference it",
      );
    return this.repo.delete(id);
  }
}
