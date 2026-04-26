import axiosInstance from '../axiosInstance'

// ── Types ──────────────────────────────────────────────────────────────

export interface AdminProductImage {
  id: string
  url: string
  altText: string | null
  isPrimary: boolean
  displayOrder: number
}

export interface AdminProductVariant {
  id: string
  sku: string
  price: number
  compareAtPrice: number | null
  stock: number
  lowStockThreshold: number | null
  isActive: boolean
  images: AdminProductImage[]
  optionValues: { optionName: string; valueName: string }[]
}

export interface AdminProduct {
  id: string
  name: string
  slug: string
  description: string | null
  keyIngredients: string | null
  basePrice: number | null
  compareAtPrice: number | null
  frontImageUrl: string | null
  hoverImageUrl: string | null
  isActive: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  metaTitle: string | null
  metaDescription: string | null
  brandId: string | null
  brand: { id: string; name: string; slug: string } | null
  categories: { id: string; name: string; slug: string }[]
  variants: AdminProductVariant[]
  tags: string[]
}

export interface AdminProductListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  brand?: string
  isActive?: boolean
}

// ── Product List ───────────────────────────────────────────────────────

export const getAllProductsAdmin = async (params?: AdminProductListParams) => {
  const { data: resp } = await axiosInstance.get('/products/admin/all', { params })
  return {
    items: (resp?.data?.items || []) as AdminProduct[],
    total: resp?.data?.total || 0,
    page: resp?.data?.page || 1,
    limit: resp?.data?.limit || 10,
    totalPages: resp?.data?.totalPages || 1
  }
}

// ── Product CRUD ───────────────────────────────────────────────────────

export const getProductByIdAdmin = async (id: string): Promise<AdminProduct> => {
  const { data: resp } = await axiosInstance.get(`/products/admin/${id}`)
  return resp?.data as AdminProduct
}

export const createProductAdmin = async (payload: Record<string, unknown>): Promise<AdminProduct> => {
  const { data: resp } = await axiosInstance.post('/products/admin', payload)
  return resp?.data as AdminProduct
}

export const updateProductAdmin = async (id: string, payload: Record<string, unknown>): Promise<AdminProduct> => {
  const { data: resp } = await axiosInstance.put(`/products/admin/${id}`, payload)
  return resp?.data as AdminProduct
}

export const updateProductStatusAdmin = async (id: string, isActive: boolean) => {
  const { data: resp } = await axiosInstance.patch(`/products/admin/${id}/status`, { isActive })
  return resp?.data as AdminProduct
}

export const softDeleteProductAdmin = async (id: string) => {
  await axiosInstance.delete(`/products/admin/${id}`)
}

export const restoreProductAdmin = async (id: string) => {
  await axiosInstance.patch(`/products/admin/${id}/restore`)
}

// ── Product ↔ Category junction ────────────────────────────────────────

export const setProductCategoriesAdmin = async (productId: string, categoryIds: string[]) => {
  await axiosInstance.put(`/products/admin/${productId}/categories`, { categoryIds })
}

// ── Variant CRUD ───────────────────────────────────────────────────────

export const updateProductVariantAdmin = async (
  id: string,
  payload: { sku?: string; price?: number; stock?: number }
): Promise<AdminProductVariant> => {
  const { data: resp } = await axiosInstance.put(`/products/admin/variants/${id}`, payload)
  return resp?.data as AdminProductVariant
}

// ── Image Management ───────────────────────────────────────────────────

export const addProductImageAdmin = async (variantId: string, formData: FormData) => {
  const { data: resp } = await axiosInstance.post(
    `/products/admin/variants/${variantId}/images`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return resp?.data
}

export const deleteProductImageAdmin = async (imageId: string) => {
  await axiosInstance.delete(`/products/admin/images/${imageId}`)
}
