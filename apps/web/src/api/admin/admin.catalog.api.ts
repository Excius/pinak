import axiosInstance from '../axiosInstance'

// ── Types ──────────────────────────────────────────────────────────────

export interface AdminCategoryImage {
  id: string
  url: string
  altText: string | null
  isPrimary: boolean
  displayOrder: number
}

export interface AdminCategory {
  id: string
  name: string
  slug: string
  parentId: string | null
  createdAt?: string
  updatedAt?: string
  children?: AdminCategory[]
  images?: AdminCategoryImage[]
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
  const { data: resp } = await axiosInstance.get('/categories/admin')
  const result = resp?.data
  const items = Array.isArray(result) ? result : (result?.items || [])
  return items.map((cat: any) => ({
    ...cat,
    images: cat.categoryImages || cat.images || []
  }))
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

export const addCategoryImageAdmin = async (categoryId: string, payload: { url: string; altText?: string; isPrimary?: boolean }) => {
  const { data: resp } = await axiosInstance.post(`/categories/admin/${categoryId}/images`, payload)
  return resp?.data
}

export const deleteCategoryImageAdmin = async (imageId: string) => {
  await axiosInstance.delete(`/categories/admin/images/${imageId}`)
}

export const setPrimaryCategoryImageAdmin = async (imageId: string) => {
  const { data: resp } = await axiosInstance.patch(`/categories/admin/images/${imageId}/primary`)
  return resp?.data
}

// ── Brands ─────────────────────────────────────────────────────────────

export const getAllBrandsAdmin = async (): Promise<AdminBrand[]> => {
  const { data: resp } = await axiosInstance.get('/brands')
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.items || [])
}

export const createBrandAdmin = async (payload: FormData | { name: string; slug?: string; logoUrl?: string; isActive?: boolean }): Promise<AdminBrand> => {
  const isForm = typeof FormData !== 'undefined' && payload instanceof FormData
  const { data: resp } = await axiosInstance.post('/brands/admin', payload, isForm ? {
    headers: { 'Content-Type': 'multipart/form-data' }
  } : undefined)
  return resp?.data as AdminBrand
}

export const updateBrandAdmin = async (id: string, payload: FormData | { name?: string; slug?: string; logoUrl?: string; isActive?: boolean }): Promise<AdminBrand> => {
  const isForm = typeof FormData !== 'undefined' && payload instanceof FormData
  const { data: resp } = await axiosInstance.put(`/brands/admin/${id}`, payload, isForm ? {
    headers: { 'Content-Type': 'multipart/form-data' }
  } : undefined)
  return resp?.data as AdminBrand
}

export const deleteBrandAdmin = async (id: string) => {
  await axiosInstance.delete(`/brands/admin/${id}`)
}
