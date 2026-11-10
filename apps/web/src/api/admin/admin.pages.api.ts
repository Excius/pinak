import axiosInstance from "../axiosInstance";
import type { PublicPageDetail } from "../pages.api";

export interface AdminPageItem extends PublicPageDetail {
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPageListParams {
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "title" | "slug" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface AdminPageListResponse {
  items: AdminPageItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreatePagePayload {
  title: string;
  slug: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isActive?: boolean;
}

export type UpdatePagePayload = Partial<CreatePagePayload>;

export const getAdminPages = async (
  params?: AdminPageListParams,
): Promise<AdminPageListResponse> => {
  const { data: resp } = await axiosInstance.get("/pages/admin", { params });
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
  }) as AdminPageListResponse;
};

export const getAdminPageById = async (id: string): Promise<AdminPageItem> => {
  const { data: resp } = await axiosInstance.get(`/pages/admin/${id}`);
  return resp?.data as AdminPageItem;
};

export const createAdminPage = async (
  payload: CreatePagePayload,
): Promise<AdminPageItem> => {
  const { data: resp } = await axiosInstance.post("/pages/admin", payload);
  return resp?.data as AdminPageItem;
};

export const updateAdminPage = async (
  id: string,
  payload: UpdatePagePayload,
): Promise<AdminPageItem> => {
  const { data: resp } = await axiosInstance.put(`/pages/admin/${id}`, payload);
  return resp?.data as AdminPageItem;
};

export const deleteAdminPage = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/pages/admin/${id}`);
};

export const restoreAdminPage = async (id: string): Promise<AdminPageItem> => {
  const { data: resp } = await axiosInstance.patch(
    `/pages/admin/${id}/restore`,
  );
  return resp?.data as AdminPageItem;
};
