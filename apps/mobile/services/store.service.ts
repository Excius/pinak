import { apiRequest } from "./api";

export interface Store {
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
}

interface StoreListResponse {
  items: Store[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function getStores(options: {
  latitude?: number;
  longitude?: number;
  radius?: number;
} = {}): Promise<StoreListResponse> {
  const params = new URLSearchParams({
    limit: "1",
    sortBy: options.latitude !== undefined ? "distance" : "name",
    sortOrder: "asc",
  });

  if (options.latitude !== undefined && options.longitude !== undefined) {
    params.set("latitude", String(options.latitude));
    params.set("longitude", String(options.longitude));
  }
  if (options.radius !== undefined) {
    params.set("radius", String(options.radius));
  }

  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: StoreListResponse;
  }>("get", `/stores?${params.toString()}`);

  return response.data;
}
