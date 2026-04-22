import axiosInstance from './axiosInstance'

export interface ProductListParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  brand?: string
  categoryId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
  inStock?: boolean
  tags?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  keyIngredients?: string
  frontImageUrl?: string
  tags: string[]
  isActive: boolean
  viewCount: number
  purchasedCount: number
  brand?: { name: string; slug: string; logoUrl?: string }
  taxClass?: { name: string; rate: number }
  categories?: Array<{ id: string; name: string; slug: string }>
  variants?: ProductVariant[]
  filterValues?: Array<{ filterGroup: string; value: string; slug: string }>
}

export interface ProductVariant {
  id: string
  sku: string
  price: number
  compareAtPrice?: number
  stock: number
  lowStockThreshold?: number
  isActive: boolean
  image?: ProductImage | null
  optionValues?: Array<{
    optionName: string
    valueName: string
  }>
}

export interface ProductImage {
  id: string
  url: string
  isPrimary: boolean
  altText?: string
  sortOrder: number
}

// Variant from /products/:id/variants endpoint (different shape from toPublicVariant)
export interface VariantDetail {
  id: string
  sku: string
  price: number
  compareAtPrice?: number
  stock: number
  lowStockThreshold?: number
  isActive: boolean
  images?: ProductImage[]
  optionValues?: Array<{
    optionName: string
    optionSlug?: string
    valueName: string
    valueSlug?: string
  }>
}

// API response shape: { success, message, data }
// For lists: data = { data: [...], pagination: {...} }
// For single: data = { ...product }

export const getProducts = async (params?: ProductListParams): Promise<Product[]> => {
  const { data: resp } = await axiosInstance.get('/products', { params })
  // resp = { success, message, data: { data: [...], pagination } }
  return resp?.data?.data || resp?.data || []
}

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const { data: resp } = await axiosInstance.get(`/products/slug/${slug}`)
  return resp?.data || resp
}

export const getProductById = async (id: string): Promise<Product> => {
  const { data: resp } = await axiosInstance.get(`/products/${id}`)
  return resp?.data || resp
}

export const getProductsByCategory = async (categoryId: string, params?: ProductListParams): Promise<Product[]> => {
  const { data: resp } = await axiosInstance.get(`/products/category/${categoryId}`, { params })
  return resp?.data?.data || resp?.data || []
}

export const searchProducts = async (query: string, params?: ProductListParams): Promise<Product[]> => {
  const { data: resp } = await axiosInstance.get('/products/search', { params: { q: query, ...params } })
  // search returns array directly in data
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.data || [])
}

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const { data: resp } = await axiosInstance.get('/products/featured')
  return resp?.data?.data || resp?.data || []
}

export const getFeaturedProductsBySection = async (sectionId: string): Promise<Product[]> => {
  const { data: resp } = await axiosInstance.get(`/products/featured/section/${sectionId}`)
  return resp?.data?.data || resp?.data || []
}

export const getProductVariants = async (productId: string): Promise<VariantDetail[]> => {
  const { data: resp } = await axiosInstance.get(`/products/${productId}/variants`)
  // variants are returned as array directly in data
  const result = resp?.data
  return Array.isArray(result) ? result : []
}
