import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export type StoreListFilter = {
  search?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

export class StoreRepository {
  constructor(private prisma: PrismaClient) {}

  buildWhereClause(filter: StoreListFilter): Prisma.StoreWhereInput {
    const where: Prisma.StoreWhereInput = {};

    if (filter.isDeleted !== undefined) {
      where.isDeleted = filter.isDeleted;
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter.city) {
      where.city = { equals: filter.city.trim(), mode: "insensitive" };
    }

    if (filter.state) {
      where.state = { equals: filter.state.trim(), mode: "insensitive" };
    }

    if (filter.zipCode) {
      where.zipCode = { equals: filter.zipCode.trim(), mode: "insensitive" };
    }

    if (filter.search && filter.search.trim().length > 0) {
      const q = filter.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
        { zipCode: { contains: q, mode: "insensitive" } },
      ];
    }

    return where;
  }

  async findMany(params: {
    where?: Prisma.StoreWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.StoreOrderByWithRelationInput;
  }) {
    return this.prisma.store.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy ?? { name: "asc" },
    });
  }

  async count(where?: Prisma.StoreWhereInput) {
    return this.prisma.store.count({ where });
  }

  async findAllActiveForGeo(where: Prisma.StoreWhereInput) {
    return this.prisma.store.findMany({
      where: {
        ...where,
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        latitude: true,
        longitude: true,
        isActive: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string, includeDeleted = false) {
    return this.prisma.store.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });
  }

  async getDistinctLocations() {
    const [cityRows, stateRows] = await Promise.all([
      this.prisma.store.findMany({
        where: { isActive: true, isDeleted: false },
        distinct: ["city"],
        select: { city: true },
        orderBy: { city: "asc" },
      }),
      this.prisma.store.findMany({
        where: { isActive: true, isDeleted: false },
        distinct: ["state"],
        select: { state: true },
        orderBy: { state: "asc" },
      }),
    ]);

    return {
      cities: cityRows.map((r) => r.city).filter(Boolean),
      states: stateRows.map((r) => r.state).filter(Boolean),
    };
  }

  async create(data: Prisma.StoreCreateInput) {
    return this.prisma.store.create({ data });
  }

  async update(id: string, data: Prisma.StoreUpdateInput) {
    return this.prisma.store.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.store.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
  }

  async restore(id: string) {
    return this.prisma.store.update({
      where: { id },
      data: {
        isDeleted: false,
        isActive: true,
      },
    });
  }
}
