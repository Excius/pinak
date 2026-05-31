import axiosInstance from '../axiosInstance'

// ── Types ──────────────────────────────────────────────────────────────

export interface ComboKitItem {
  id: string
  productVariantId: string
  quantity: number
  sortOrder: number
  originalPrice: number | null
  discountedPrice: number | null
  isRequired: boolean
  productVariant?: {
    id: string
    sku: string
    price: number
    stock: number
    imageUrl: string | null
    product?: {
      id: string
      name: string
      frontImageUrl: string | null
    }
  } | null
}

export interface AdminComboKit {
  id: string
  name: string
  slug: string
  description: string | null
  audience: string | null
  price: number
  pricingStrategy: 'FIXED_PRICE' | 'CALCULATED' | 'DYNAMIC'
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | null
  discountValue: number | null
  tags: string[]
  imageUrl: string | null
  viewCount: number
  purchasedCount: number
  isActive: boolean
  isDeleted: boolean
  sortOrder: number
  items: ComboKitItem[]
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string | null
  seoKeyword?: string | null
  createdAt: string
  updatedAt: string
}

// ── Combo Kit CRUD ─────────────────────────────────────────────────────

export const getAllComboKitsAdmin = async () => {
  const { data: resp } = await axiosInstance.get('/combo-kits/admin/all')
  return {
    items: (resp?.data?.items || []) as AdminComboKit[],
    total: resp?.data?.pagination?.total || 0,
  }
}

export const getComboKitByIdAdmin = async (id: string): Promise<AdminComboKit> => {
  const { data: resp } = await axiosInstance.get(`/combo-kits/admin/${id}`)
  return resp?.data as AdminComboKit
}

export const createComboKitAdmin = async (payload: Record<string, unknown>): Promise<AdminComboKit> => {
  const { data: resp } = await axiosInstance.post('/combo-kits', payload)
  return resp?.data as AdminComboKit
}

export const updateComboKitAdmin = async (id: string, payload: Record<string, unknown>): Promise<AdminComboKit> => {
  const { data: resp } = await axiosInstance.put(`/combo-kits/${id}`, payload)
  return resp?.data as AdminComboKit
}

export const softDeleteComboKitAdmin = async (id: string) => {
  await axiosInstance.patch(`/combo-kits/${id}/soft-delete`)
}

export const restoreComboKitAdmin = async (id: string) => {
  await axiosInstance.patch(`/combo-kits/${id}/restore`)
}

export const updateComboKitStatusAdmin = async (id: string, isActive: boolean) => {
  const { data: resp } = await axiosInstance.patch(`/combo-kits/${id}/status`, { isActive })
  return resp?.data as AdminComboKit
}

// ── Combo Kit Items CRUD ───────────────────────────────────────────────

export const addComboKitItemAdmin = async (
  comboKitId: string,
  payload: { productVariantId: string; quantity?: number; isRequired?: boolean }
): Promise<ComboKitItem> => {
  const { data: resp } = await axiosInstance.post(`/combo-kits/${comboKitId}/items`, payload)
  return resp?.data as ComboKitItem
}

export const updateComboKitItemAdmin = async (
  comboKitId: string,
  itemId: string,
  payload: { quantity?: number; isRequired?: boolean; sortOrder?: number }
): Promise<ComboKitItem> => {
  const { data: resp } = await axiosInstance.put(`/combo-kits/${comboKitId}/items/${itemId}`, payload)
  return resp?.data as ComboKitItem
}

export const removeComboKitItemAdmin = async (comboKitId: string, itemId: string) => {
  await axiosInstance.delete(`/combo-kits/${comboKitId}/items/${itemId}`)
}

// ── Featured Sections ──────────────────────────────────────────────────

export interface AdminFeaturedSection {
  id: string
  title: string
  type: 'EXPERT_PICKS' | 'HOMEPAGE_HERO' | 'DEALS'
  priority: number
  productCount?: number
  createdAt?: string
  updatedAt?: string
}

export const getAllFeaturedSectionsAdmin = async (): Promise<AdminFeaturedSection[]> => {
  const { data: resp } = await axiosInstance.get('/featured-sections/admin/all')
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.items || [])
}

export const createFeaturedSectionAdmin = async (payload: { title: string; type: string; priority?: number }): Promise<AdminFeaturedSection> => {
  const { data: resp } = await axiosInstance.post('/featured-sections/admin', payload)
  return resp?.data as AdminFeaturedSection
}

export const updateFeaturedSectionAdmin = async (id: string, payload: { title?: string; type?: string; priority?: number }): Promise<AdminFeaturedSection> => {
  const { data: resp } = await axiosInstance.put(`/featured-sections/admin/${id}`, payload)
  return resp?.data as AdminFeaturedSection
}

export const deleteFeaturedSectionAdmin = async (id: string) => {
  await axiosInstance.delete(`/featured-sections/admin/${id}`)
}
