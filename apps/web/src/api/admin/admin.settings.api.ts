import axiosInstance from "../axiosInstance";

// ── Tax Classes ────────────────────────────────────────────────────────

export interface TaxClass {
  id: string;
  name: string;
  rate: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getAllTaxClasses = async (): Promise<TaxClass[]> => {
  const { data: resp } = await axiosInstance.get("/tax-classes");
  return Array.isArray(resp?.data) ? resp.data : [];
};

export const createTaxClass = async (payload: {
  name: string;
  rate: number;
}): Promise<TaxClass> => {
  const { data: resp } = await axiosInstance.post("/tax-classes", payload);
  return resp?.data as TaxClass;
};

export const updateTaxClass = async (
  id: string,
  payload: { name?: string; rate?: number },
): Promise<TaxClass> => {
  const { data: resp } = await axiosInstance.put(`/tax-classes/${id}`, payload);
  return resp?.data as TaxClass;
};

export const deleteTaxClass = async (id: string) => {
  await axiosInstance.delete(`/tax-classes/${id}`);
};

// ── Weight Classes ─────────────────────────────────────────────────────

export interface WeightClass {
  id: string;
  name: string;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getAllWeightClasses = async (): Promise<WeightClass[]> => {
  const { data: resp } = await axiosInstance.get("/weight-classes");
  return Array.isArray(resp?.data) ? resp.data : [];
};

export const createWeightClass = async (payload: {
  name: string;
  unit: string;
}): Promise<WeightClass> => {
  const { data: resp } = await axiosInstance.post("/weight-classes", payload);
  return resp?.data as WeightClass;
};

export const updateWeightClass = async (
  id: string,
  payload: { name?: string; unit?: string },
): Promise<WeightClass> => {
  const { data: resp } = await axiosInstance.put(
    `/weight-classes/${id}`,
    payload,
  );
  return resp?.data as WeightClass;
};

export const deleteWeightClass = async (id: string) => {
  await axiosInstance.delete(`/weight-classes/${id}`);
};

// ── Length Classes ──────────────────────────────────────────────────────

export interface LengthClass {
  id: string;
  name: string;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getAllLengthClasses = async (): Promise<LengthClass[]> => {
  const { data: resp } = await axiosInstance.get("/length-classes");
  return Array.isArray(resp?.data) ? resp.data : [];
};

export const createLengthClass = async (payload: {
  name: string;
  unit: string;
}): Promise<LengthClass> => {
  const { data: resp } = await axiosInstance.post("/length-classes", payload);
  return resp?.data as LengthClass;
};

export const updateLengthClass = async (
  id: string,
  payload: { name?: string; unit?: string },
): Promise<LengthClass> => {
  const { data: resp } = await axiosInstance.put(
    `/length-classes/${id}`,
    payload,
  );
  return resp?.data as LengthClass;
};

export const deleteLengthClass = async (id: string) => {
  await axiosInstance.delete(`/length-classes/${id}`);
};

// ── Contact & General Settings ──────────────────────────────────────────

export interface AdminSettingItem {
  id: string;
  key: string;
  value: string;
  group: string;
  description?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export const listAdminSettings = async (
  group?: string,
): Promise<AdminSettingItem[]> => {
  const { data: resp } = await axiosInstance.get("/settings/admin", {
    params: group ? { group } : undefined,
  });
  return Array.isArray(resp?.data) ? resp.data : [];
};

export const updateAdminSettings = async (
  payload: Record<string, string>,
): Promise<Record<string, string>> => {
  const { data: resp } = await axiosInstance.put("/settings/admin", payload);
  return (resp?.data || {}) as Record<string, string>;
};

export const setAdminSetting = async (
  key: string,
  payload: {
    value: string;
    group?: string;
    description?: string;
    isPublic?: boolean;
  },
): Promise<AdminSettingItem> => {
  const { data: resp } = await axiosInstance.put(
    `/settings/admin/${encodeURIComponent(key)}`,
    payload,
  );
  return resp?.data as AdminSettingItem;
};
