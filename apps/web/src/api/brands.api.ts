import axiosInstance from './axiosInstance'

export interface Brand {
  id: string
  name: string
  slug: string
  logoUrl?: string
  isActive: boolean
}

export const getBrands = async (): Promise<Brand[]> => {
  const { data: resp } = await axiosInstance.get('/brands')
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.data || result?.brands || [])
}
