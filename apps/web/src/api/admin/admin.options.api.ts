import axiosInstance from '../axiosInstance'

// ── Types ──────────────────────────────────────────────────────────────

export interface AdminOptionValue {
  id: string
  value: string
  sortOrder: number
  optionId: string
}

export interface AdminOption {
  id: string
  name: string
  sortOrder: number
  values: AdminOptionValue[]
  createdAt: string
  updatedAt: string
}

// ── Option CRUD ────────────────────────────────────────────────────────

export const getOptions = async (): Promise<AdminOption[]> => {
  const { data } = await axiosInstance.get('/options/admin')
  return data.data || data || []
}

export const getOption = async (id: string): Promise<AdminOption> => {
  const { data } = await axiosInstance.get(`/options/admin/${id}`)
  return data.data || data
}

export const createOption = async (payload: { name: string; sortOrder?: number }): Promise<AdminOption> => {
  const { data } = await axiosInstance.post('/options', payload)
  return data.data || data
}

export const updateOption = async (id: string, payload: { name?: string; sortOrder?: number }): Promise<AdminOption> => {
  const { data } = await axiosInstance.put(`/options/${id}`, payload)
  return data.data || data
}

export const deleteOption = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/options/${id}`)
}

// ── Option Value CRUD ──────────────────────────────────────────────────

export const createOptionValue = async (optionId: string, payload: { value: string; sortOrder?: number }): Promise<AdminOptionValue> => {
  const { data } = await axiosInstance.post(`/options/${optionId}/values`, payload)
  return data.data || data
}

export const updateOptionValue = async (valueId: string, payload: { value?: string; sortOrder?: number }): Promise<AdminOptionValue> => {
  const { data } = await axiosInstance.put(`/options/values/${valueId}`, payload)
  return data.data || data
}

export const deleteOptionValue = async (valueId: string): Promise<void> => {
  await axiosInstance.delete(`/options/values/${valueId}`)
}
