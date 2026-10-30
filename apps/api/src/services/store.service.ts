import { Prisma } from "../generated/prisma/client.js";
import { NotFoundError, ValidationError } from "../lib/error.js";
import { StoreRepository, StoreListFilter } from "../repositories/store.repository.js";
import { StoreRecord, PaginationMeta } from "../lib/mappers/store.mapper.js";

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // 2 decimal places
}

export type PublicStoreQuery = {
  search?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // In km
  page?: number;
  limit?: number;
  sortBy?: "name" | "city" | "state" | "distance" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type AdminStoreQuery = {
  search?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "city" | "state" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type CreateStoreInput = {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  isActive?: boolean;
};

export type UpdateStoreInput = Partial<CreateStoreInput>;

export class StoreService {
  constructor(private repo: StoreRepository) {}

  async listPublicStores(query: PublicStoreQuery): Promise<{
    stores: StoreRecord[];
    pagination: PaginationMeta;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

    const filter: StoreListFilter = {
      search: query.search,
      city: query.city,
      state: query.state,
      zipCode: query.zipCode,
      isActive: true,
      isDeleted: false,
    };

    const where = this.repo.buildWhereClause(filter);

    // If geolocation (latitude and longitude) is provided, calculate distances
    if (query.latitude !== undefined && query.longitude !== undefined) {
      const userLat = query.latitude;
      const userLon = query.longitude;

      const allStores = await this.repo.findAllActiveForGeo(where);

      // Attach distance to each store
      let storesWithDistance: StoreRecord[] = allStores.map((store) => {
        const distance = calculateDistanceKm(
          userLat,
          userLon,
          store.latitude,
          store.longitude,
        );
        return {
          ...store,
          distance,
        };
      });

      // Filter by radius if provided
      if (query.radius !== undefined && query.radius > 0) {
        const r = query.radius;
        storesWithDistance = storesWithDistance.filter(
          (s) => s.distance !== null && s.distance !== undefined && s.distance <= r,
        );
      }

      // Sort
      const sortBy = query.sortBy ?? "distance";
      storesWithDistance.sort((a, b) => {
        let comp = 0;
        if (sortBy === "distance") {
          const distA = a.distance ?? Infinity;
          const distB = b.distance ?? Infinity;
          comp = distA - distB;
        } else if (sortBy === "name") {
          comp = a.name.localeCompare(b.name);
        } else if (sortBy === "city") {
          comp = a.city.localeCompare(b.city);
        } else if (sortBy === "state") {
          comp = a.state.localeCompare(b.state);
        } else if (sortBy === "createdAt") {
          comp = a.createdAt.getTime() - b.createdAt.getTime();
        }

        return sortOrder === "desc" ? -comp : comp;
      });

      const total = storesWithDistance.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;
      const paginatedStores = storesWithDistance.slice(skip, skip + limit);

      return {
        stores: paginatedStores,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    }

    // Direct database pagination when lat/lng is not provided
    const sortBy = query.sortBy ?? "name";
    const orderBy: Prisma.StoreOrderByWithRelationInput = {};
    if (sortBy === "name") orderBy.name = sortOrder;
    else if (sortBy === "city") orderBy.city = sortOrder;
    else if (sortBy === "state") orderBy.state = sortOrder;
    else if (sortBy === "createdAt") orderBy.createdAt = sortOrder;
    else orderBy.name = sortOrder;

    const skip = (page - 1) * limit;
    const [stores, total] = await Promise.all([
      this.repo.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.repo.count(where),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      stores,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getPublicStoreById(id: string): Promise<StoreRecord> {
    const store = await this.repo.findById(id, false);
    if (!store || !store.isActive || store.isDeleted) {
      throw new NotFoundError("Store not found");
    }
    return store;
  }

  async getStoreLocations(): Promise<{ cities: string[]; states: string[] }> {
    return this.repo.getDistinctLocations();
  }

  async listAdminStores(query: AdminStoreQuery): Promise<{
    stores: StoreRecord[];
    pagination: PaginationMeta;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

    const filter: StoreListFilter = {
      search: query.search,
      city: query.city,
      state: query.state,
      zipCode: query.zipCode,
      isActive: query.isActive,
      isDeleted: query.includeDeleted ? undefined : false,
    };

    const where = this.repo.buildWhereClause(filter);

    const sortBy = query.sortBy ?? "createdAt";
    const orderBy: Prisma.StoreOrderByWithRelationInput = {};
    if (sortBy === "name") orderBy.name = sortOrder;
    else if (sortBy === "city") orderBy.city = sortOrder;
    else if (sortBy === "state") orderBy.state = sortOrder;
    else if (sortBy === "updatedAt") orderBy.updatedAt = sortOrder;
    else orderBy.createdAt = sortOrder;

    const skip = (page - 1) * limit;
    const [stores, total] = await Promise.all([
      this.repo.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.repo.count(where),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      stores,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getAdminStoreById(id: string): Promise<StoreRecord> {
    const store = await this.repo.findById(id, true);
    if (!store) {
      throw new NotFoundError("Store not found");
    }
    return store;
  }

  async createStore(input: CreateStoreInput): Promise<StoreRecord> {
    if (input.latitude < -90 || input.latitude > 90) {
      throw new ValidationError("Latitude must be between -90 and 90");
    }
    if (input.longitude < -180 || input.longitude > 180) {
      throw new ValidationError("Longitude must be between -180 and 180");
    }

    const data: Prisma.StoreCreateInput = {
      name: input.name.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      zipCode: input.zipCode.trim(),
      phone: input.phone ? input.phone.trim() : null,
      latitude: input.latitude,
      longitude: input.longitude,
      isActive: input.isActive !== undefined ? input.isActive : true,
    };

    return this.repo.create(data);
  }

  async updateStore(id: string, input: UpdateStoreInput): Promise<StoreRecord> {
    const existing = await this.repo.findById(id, true);
    if (!existing) {
      throw new NotFoundError("Store not found");
    }

    if (input.latitude !== undefined && (input.latitude < -90 || input.latitude > 90)) {
      throw new ValidationError("Latitude must be between -90 and 90");
    }
    if (input.longitude !== undefined && (input.longitude < -180 || input.longitude > 180)) {
      throw new ValidationError("Longitude must be between -180 and 180");
    }

    const data: Prisma.StoreUpdateInput = {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.address !== undefined && { address: input.address.trim() }),
      ...(input.city !== undefined && { city: input.city.trim() }),
      ...(input.state !== undefined && { state: input.state.trim() }),
      ...(input.zipCode !== undefined && { zipCode: input.zipCode.trim() }),
      ...(input.phone !== undefined && {
        phone: input.phone ? input.phone.trim() : null,
      }),
      ...(input.latitude !== undefined && { latitude: input.latitude }),
      ...(input.longitude !== undefined && { longitude: input.longitude }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    };

    return this.repo.update(id, data);
  }

  async deleteStore(id: string): Promise<void> {
    const existing = await this.repo.findById(id, false);
    if (!existing) {
      throw new NotFoundError("Store not found");
    }
    await this.repo.softDelete(id);
  }

  async restoreStore(id: string): Promise<StoreRecord> {
    const existing = await this.repo.findById(id, true);
    if (!existing) {
      throw new NotFoundError("Store not found");
    }
    return this.repo.restore(id);
  }
}
