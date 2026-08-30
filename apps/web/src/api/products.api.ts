import axiosInstance from './axiosInstance'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

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
  filterValueIds?: string[] | string
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
  tags?: string[]
  price: number
  taxAmount?: number
  priceWithTax?: number
  compareAtPrice?: number
  compareAtPriceWithTax?: number | null
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
  tags?: string[]
  price: number
  taxAmount?: number
  priceWithTax?: number
  compareAtPrice?: number
  compareAtPriceWithTax?: number | null
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

const buildQueryParams = (params?: ProductListParams) => {
  if (!params) return undefined
  const queryParams = { ...params }
  if (Array.isArray(queryParams.filterValueIds)) {
    queryParams.filterValueIds = queryParams.filterValueIds.join(',')
  }
  return queryParams
}

export const getProducts = async (params?: ProductListParams): Promise<Product[]> => {
  const { data: resp } = await axiosInstance.get('/products', { params: buildQueryParams(params) })
  const result = resp?.data
  return result?.items || (Array.isArray(result) ? result : [])
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
  const { data: resp } = await axiosInstance.get(`/products/category/${categoryId}`, { params: buildQueryParams(params) })
  const result = resp?.data
  return result?.items || (Array.isArray(result) ? result : [])
}

export const searchProducts = async (query: string, params?: ProductListParams): Promise<Product[]> => {
  const { data: resp } = await axiosInstance.get('/products/search', { params: { q: query, ...buildQueryParams(params) } })
  const result = resp?.data
  return result?.items || (Array.isArray(result) ? result : [])
}

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const { data: resp } = await axiosInstance.get('/products/featured')
  const result = resp?.data
  return result?.items || (Array.isArray(result) ? result : [])
}

export const getBestsellers = async (params?: { timeframe?: 'all_time' | 'month' | 'week'; page?: number; limit?: number; categoryId?: string }): Promise<Product[]> => {
  const { data: resp } = await axiosInstance.get('/products/bestsellers', { params })
  const result = resp?.data
  return result?.items || (Array.isArray(result) ? result : [])
}

export interface BestsellerAnalytics {
  totalUnitsSold: number
  grossRevenue: number
  topCategory: string
  timeframe: string
}

export const getBestsellerAnalytics = async (timeframe: 'all_time' | 'month' | 'week'): Promise<BestsellerAnalytics | null> => {
  try {
    const { data: resp } = await axiosInstance.get('/products/admin/bestsellers/analytics', { params: { timeframe } })
    return resp?.data || null
  } catch (error) {
    return null
  }
}

export const getFeaturedProductsBySection = async (sectionId: string): Promise<Product[]> => {
  const { data: resp } = await axiosInstance.get(`/products/featured/section/${sectionId}`)
  const result = resp?.data
  return result?.items || (Array.isArray(result) ? result : [])
}

export const getProductVariants = async (productId: string): Promise<VariantDetail[]> => {
  const { data: resp } = await axiosInstance.get(`/products/${productId}/variants`)
  // variants are returned as array directly in data
  const result = resp?.data
  return Array.isArray(result) ? result : []
}

export const getRelatedProducts = async (productId: string): Promise<Product[]> => {
  try {
    const token = localStorage.getItem('accessToken')
    const { data: resp } = await axios.get(`${API_URL}/api/v1/products/${productId}/related`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    const result = resp?.data
    if (!Array.isArray(result)) return []

    // The backend returns an array of RelatedProduct objects (junction table)
    // with partial 'relatedProduct' objects. We need to fetch the full product details
    // to render the ProductCard correctly (with prices, variants, categories).
    const partialProducts = result.map((p: any) => p.relatedProduct).filter(Boolean)
    
    if (partialProducts.length === 0) return []
    
    const fullProductsPromises = partialProducts.map((p: any) => getProductById(p.id))
    const fullProducts = await Promise.all(fullProductsPromises)
    
    return fullProducts.filter(Boolean) as Product[]
  } catch (error) {
    return []
  }
}
