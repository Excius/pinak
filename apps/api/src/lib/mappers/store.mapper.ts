export type StoreRecord = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  distance?: number | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PublicStore = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
  distance?: number | null;
};

export type AdminStore = PublicStore & {
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const toPublicStore = (
  store: StoreRecord,
  distance?: number | null,
): PublicStore => ({
  id: store.id,
  name: store.name,
  address: store.address,
  city: store.city,
  state: store.state,
  zipCode: store.zipCode,
  phone: store.phone ?? null,
  latitude: store.latitude,
  longitude: store.longitude,
  isActive: store.isActive,
  distance: distance !== undefined ? distance : (store.distance ?? null),
});

export const toPublicStoreList = (
  stores: StoreRecord[],
  pagination: PaginationMeta,
): { items: PublicStore[]; pagination: PaginationMeta } => ({
  items: stores.map((s) => toPublicStore(s, s.distance)),
  pagination,
});

export const toAdminStore = (store: StoreRecord): AdminStore => ({
  id: store.id,
  name: store.name,
  address: store.address,
  city: store.city,
  state: store.state,
  zipCode: store.zipCode,
  phone: store.phone ?? null,
  latitude: store.latitude,
  longitude: store.longitude,
  isActive: store.isActive,
  distance: store.distance ?? null,
  isDeleted: store.isDeleted,
  createdAt: store.createdAt,
  updatedAt: store.updatedAt,
});

export const toAdminStoreList = (
  stores: StoreRecord[],
  pagination: PaginationMeta,
): { items: AdminStore[]; pagination: PaginationMeta } => ({
  items: stores.map(toAdminStore),
  pagination,
});
