import axiosInstance from "../axiosInstance";
import type { PublicStore, PaginationMeta } from "../stores.api";

export interface AdminStore extends PublicStore {
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStoreListParams {
  search?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "city" | "state" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface AdminStoreListResponse {
  items: AdminStore[];
  pagination: PaginationMeta;
}

export interface CreateStorePayload {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  isActive?: boolean;
}

export type UpdateStorePayload = Partial<CreateStorePayload>;

export const getAdminStores = async (
  params?: AdminStoreListParams,
): Promise<AdminStoreListResponse> => {
  const { data: resp } = await axiosInstance.get("/stores/admin", { params });
  return (resp?.data || {
    items: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  }) as AdminStoreListResponse;
};

export const getAdminStoreById = async (id: string): Promise<AdminStore> => {
  const { data: resp } = await axiosInstance.get(`/stores/admin/${id}`);
  return resp?.data as AdminStore;
};

export const createAdminStore = async (
  payload: CreateStorePayload,
): Promise<AdminStore> => {
  const { data: resp } = await axiosInstance.post("/stores/admin", payload);
  return resp?.data as AdminStore;
};

export const updateAdminStore = async (
  id: string,
  payload: UpdateStorePayload,
): Promise<AdminStore> => {
  const { data: resp } = await axiosInstance.put(
    `/stores/admin/${id}`,
    payload,
  );
  return resp?.data as AdminStore;
};

export const deleteAdminStore = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/stores/admin/${id}`);
};

export const restoreAdminStore = async (id: string): Promise<AdminStore> => {
  const { data: resp } = await axiosInstance.patch(
    `/stores/admin/${id}/restore`,
  );
  return resp?.data as AdminStore;
};
