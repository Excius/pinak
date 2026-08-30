import axiosInstance from './axiosInstance'
import { getProducts } from './products.api'

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
    productId: string
    sku: string
    price: number
    taxAmount?: number
    priceWithTax?: number
    comparePrice?: number
    comparePriceWithTax?: number | null
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
  return result?.items || (Array.isArray(result) ? result : [])
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
  let items: ComboKitItem[] = Array.isArray(result) ? result : []

  try {
    const variantIds = items.map(item => item.productVariant?.id).filter(Boolean) as string[]
    if (variantIds.length > 0) {
      // Since the backend API strips the productId and doesn't return product details for variants,
      // and we cannot modify the backend, we fetch products to map variant IDs back to their products.
      // We use limit=50 and loop to prevent 400 Bad Request errors from exceeding maximum limit.
      let allProducts: any[] = []
      let page = 1
      while (page <= 20) {
        const pageProducts = await getProducts({ page, limit: 50 })
        if (!pageProducts || pageProducts.length === 0) break
        allProducts = [...allProducts, ...pageProducts]
        if (pageProducts.length < 50) break
        page++
      }
      
      const variantToProductMap = new Map<string, any>()
      allProducts.forEach(product => {
        if (product.variants) {
          product.variants.forEach((v: any) => {
            variantToProductMap.set(v.id, product)
          })
        }
      })

      items = items.map(item => {
        if (item.productVariant?.id) {
          const product = variantToProductMap.get(item.productVariant.id)
          if (product) {
            item.productVariant.product = {
              id: product.id,
              name: product.name,
              slug: product.slug,
              frontImageUrl: product.frontImageUrl
            }
          }
        }
        return item
      })
    }
  } catch (err) {
    console.error("Failed to fetch product details for combo kit items", err)
  }

  return items
}

export const searchComboKits = async (query: string): Promise<ComboKit[]> => {
  const { data: resp } = await axiosInstance.get('/combo-kits/search', { params: { q: query } })
  const result = resp?.data
  return result?.items || (Array.isArray(result) ? result : [])
}
