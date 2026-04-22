import axiosInstance from './axiosInstance'

export interface FeaturedSection {
  id: string
  title: string
  type: 'EXPERT_PICKS' | 'HOMEPAGE_HERO' | 'DEALS'
  priority: number
  products?: Array<{
    id: string
    productId: string
    product: {
      id: string
      name: string
      slug: string
      frontImageUrl?: string
      description?: string
      variants?: Array<{
        id: string
        price: number
        comparePrice?: number
        images?: Array<{ url: string; altText?: string }>
      }>
    }
  }>
  createdAt: string
  updatedAt: string
}

export const getFeaturedSections = async () => {
  const { data } = await axiosInstance.get('/featured-sections')
  return data
}

export const getFeaturedSectionById = async (id: string) => {
  const { data } = await axiosInstance.get(`/featured-sections/${id}`)
  return data
}
