import axiosInstance from './axiosInstance'

export interface WishlistItem {
  id: string
  wishlistId: string
  productVariantId: string
  productVariant?: {
    id: string
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
      description?: string
    }
    images?: Array<{ url: string; altText?: string; isPrimary: boolean }>
    optionValues?: Array<{
      optionValue: {
        value: string
        option: { name: string }
      }
    }>
  }
  createdAt: string
}

export interface Wishlist {
  id: string
  userId: string
  items: WishlistItem[]
}

export const getWishlist = async (): Promise<Wishlist> => {
  const { data } = await axiosInstance.get('/wishlist')
  return data?.data || data
}

export const addToWishlist = async (productVariantId: string) => {
  const { data } = await axiosInstance.post('/wishlist/items', { productVariantId })
  return data
}

export const removeFromWishlist = async (itemId: string) => {
  const { data } = await axiosInstance.delete(`/wishlist/items/${itemId}`)
  return data
}

export const clearWishlist = async () => {
  const { data } = await axiosInstance.delete('/wishlist')
  return data
}
