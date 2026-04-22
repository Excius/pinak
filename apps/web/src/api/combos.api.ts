import axiosInstance from './axiosInstance'

export interface ComboKit {
  id: string
  name: string
  slug: string
  description?: string
  audience?: string
  price: number
  pricingStrategy: string
  discountType?: string
  discountValue?: number
  tags: string[]
  imageUrl?: string
  viewCount: number
  purchasedCount: number
  isActive: boolean
  items?: ComboKitItem[]
  createdAt: string
  updatedAt: string
}

export interface ComboKitItem {
  id: string
  comboKitId: string
  productVariantId: string
  quantity: number
  sortOrder: number
  originalPrice?: number
  discountedPrice?: number
  isRequired: boolean
  productVariant?: {
    id: string
    sku: string
    price: number
    comparePrice?: number
    stock: number
    product?: {
      id: string
      name: string
      slug: string
      frontImageUrl?: string
    }
    images?: Array<{ url: string; altText?: string }>
    optionValues?: Array<{
      optionValue: {
        value: string
        option: { name: string }
      }
    }>
  }
}

export const getComboKits = async (params?: { page?: number; limit?: number; sort?: string }): Promise<ComboKit[]> => {
  const { data: resp } = await axiosInstance.get('/combo-kits', { params })
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.data || result?.comboKits || [])
}

export const getComboKitBySlug = async (slug: string): Promise<ComboKit> => {
  const { data: resp } = await axiosInstance.get(`/combo-kits/slug/${slug}`)
  return resp?.data || resp
}

export const getComboKitById = async (id: string): Promise<ComboKit> => {
  const { data: resp } = await axiosInstance.get(`/combo-kits/${id}`)
  return resp?.data || resp
}

export const getComboKitItems = async (id: string): Promise<ComboKitItem[]> => {
  const { data: resp } = await axiosInstance.get(`/combo-kits/${id}/items`)
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.data || result?.items || [])
}

export const searchComboKits = async (query: string): Promise<ComboKit[]> => {
  const { data: resp } = await axiosInstance.get('/combo-kits/search', { params: { q: query } })
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.data || [])
}
