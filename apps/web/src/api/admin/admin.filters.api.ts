import axiosInstance from '../axiosInstance'

// ── Types ──────────────────────────────────────────────────────────────

export interface AdminFilterValue {
  id: string
  name: string
  slug: string
  sortOrder: number
  filterGroupId: string
}

export interface AdminFilterGroup {
  id: string
  name: string
  slug: string
  sortOrder: number
  isActive: boolean
  values: AdminFilterValue[]
  createdAt: string
  updatedAt: string
}

// ── Filter Group CRUD ──────────────────────────────────────────────────

export const getFilterGroups = async (): Promise<AdminFilterGroup[]> => {
  const { data } = await axiosInstance.get('/filters/admin/groups')
  return data.data || data || []
}

export const getFilterGroup = async (id: string): Promise<AdminFilterGroup> => {
  const { data } = await axiosInstance.get(`/filters/admin/groups/${id}`)
  return data.data || data
}

export const createFilterGroup = async (payload: { name: string; sortOrder?: number; isActive?: boolean }): Promise<AdminFilterGroup> => {
  const { data } = await axiosInstance.post('/filters/groups', payload)
  return data.data || data
}

export const updateFilterGroup = async (id: string, payload: { name?: string; sortOrder?: number; isActive?: boolean }): Promise<AdminFilterGroup> => {
  const { data } = await axiosInstance.put(`/filters/groups/${id}`, payload)
  return data.data || data
}

export const deleteFilterGroup = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/filters/groups/${id}`)
}

// ── Filter Value CRUD ──────────────────────────────────────────────────

export const createFilterValue = async (groupId: string, payload: { name: string; sortOrder?: number }): Promise<AdminFilterValue> => {
  const { data } = await axiosInstance.post(`/filters/groups/${groupId}/values`, payload)
  return data.data || data
}

export const updateFilterValue = async (valueId: string, payload: { name?: string; sortOrder?: number }): Promise<AdminFilterValue> => {
  const { data } = await axiosInstance.put(`/filters/values/${valueId}`, payload)
  return data.data || data
}

export const deleteFilterValue = async (valueId: string): Promise<void> => {
  await axiosInstance.delete(`/filters/values/${valueId}`)
}
