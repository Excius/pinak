import axiosInstance from '../axiosInstance'

// ── Types ──────────────────────────────────────────────────────────────

export interface AdminCategory {
  id: string
  name: string
  slug: string
  parentId: string | null
  createdAt?: string
  updatedAt?: string
  children?: AdminCategory[]
}

export interface AdminBrand {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

// ── Categories ─────────────────────────────────────────────────────────

export const getAllCategoriesAdmin = async (): Promise<AdminCategory[]> => {
  const { data: resp } = await axiosInstance.get('/categories')
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.items || [])
}

export const createCategoryAdmin = async (payload: { name: string; slug?: string; parentId?: string }): Promise<AdminCategory> => {
  const { data: resp } = await axiosInstance.post('/categories/admin', payload)
  return resp?.data as AdminCategory
}

export const updateCategoryAdmin = async (id: string, payload: { name?: string; slug?: string; parentId?: string | null }): Promise<AdminCategory> => {
  const { data: resp } = await axiosInstance.put(`/categories/admin/${id}`, payload)
  return resp?.data as AdminCategory
}

export const deleteCategoryAdmin = async (id: string) => {
  await axiosInstance.delete(`/categories/admin/${id}`)
}

// ── Brands ─────────────────────────────────────────────────────────────

export const getAllBrandsAdmin = async (): Promise<AdminBrand[]> => {
  const { data: resp } = await axiosInstance.get('/brands')
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.items || [])
}

export const createBrandAdmin = async (payload: { name: string; slug?: string; logoUrl?: string; isActive?: boolean }): Promise<AdminBrand> => {
  const { data: resp } = await axiosInstance.post('/brands/admin', payload)
  return resp?.data as AdminBrand
}

export const updateBrandAdmin = async (id: string, payload: { name?: string; slug?: string; logoUrl?: string; isActive?: boolean }): Promise<AdminBrand> => {
  const { data: resp } = await axiosInstance.put(`/brands/admin/${id}`, payload)
  return resp?.data as AdminBrand
}

export const deleteBrandAdmin = async (id: string) => {
  await axiosInstance.delete(`/brands/admin/${id}`)
}
