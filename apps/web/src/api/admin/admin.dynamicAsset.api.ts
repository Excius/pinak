import  axiosInstance from '../axiosInstance'

export interface AdminDynamicAsset {
  id: string
  slug: string
  url: string
  s3Key: string | null
  type: 'IMAGE' | 'VIDEO' | 'LOTTIE'
  title: string | null
  description: string | null
  metadata: any | null
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminDynamicAssetListParams {
  page?: number
  limit?: number
  isActive?: boolean
  search?: string
}

export const getAllDynamicAssetsAdmin = async (params?: AdminDynamicAssetListParams) => {
  const { data } = await axiosInstance.get('/dynamic-assets/admin/all', { params })
  return data.data as { items: AdminDynamicAsset[]; total: number; page: number; limit: number; totalPages: number }
}

export const getDynamicAssetByIdAdmin = async (id: string): Promise<AdminDynamicAsset> => {
  const { data } = await axiosInstance.get(`/dynamic-assets/admin/${id}`)
  return data.data
}

export const createDynamicAssetAdmin = async (payload: FormData): Promise<AdminDynamicAsset> => {
  const { data } = await axiosInstance.post('/dynamic-assets/admin', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data.data
}

export const updateDynamicAssetAdmin = async (id: string, payload: any): Promise<AdminDynamicAsset> => {
  const { data } = await axiosInstance.patch(`/dynamic-assets/admin/${id}`, payload)
  return data.data
}

export const replaceDynamicAssetFileAdmin = async (id: string, payload: FormData): Promise<AdminDynamicAsset> => {
  const { data } = await axiosInstance.put(`/dynamic-assets/admin/${id}/file`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data.data
}

export const softDeleteDynamicAssetAdmin = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/dynamic-assets/admin/${id}`)
}

export const restoreDynamicAssetAdmin = async (id: string): Promise<void> => {
  await axiosInstance.patch(`/dynamic-assets/admin/${id}/restore`)
}

export const hardDeleteDynamicAssetAdmin = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/dynamic-assets/admin/${id}/hard`)
}
