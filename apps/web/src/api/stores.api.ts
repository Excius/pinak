import axiosInstance from './axiosInstance'

export interface PublicStore {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string | null
  latitude: number
  longitude: number
  isActive: boolean
  distance?: number | null // in km
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface StoreListParams {
  latitude?: number
  longitude?: number
  radius?: number
  search?: string
  city?: string
  state?: string
  zipCode?: string
  page?: number
  limit?: number
  sortBy?: 'distance' | 'name' | 'city' | 'state' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface StoreListResponse {
  items: PublicStore[]
  pagination: PaginationMeta
}

export interface StoreLocationsResponse {
  cities: string[]
  states: string[]
}

export const getStores = async (params?: StoreListParams): Promise<StoreListResponse> => {
  const { data: resp } = await axiosInstance.get('/stores', { params })
  return (resp?.data || { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } }) as StoreListResponse
}

export const getStoreLocations = async (): Promise<StoreLocationsResponse> => {
  const { data: resp } = await axiosInstance.get('/stores/locations')
  return (resp?.data || { cities: [], states: [] }) as StoreLocationsResponse
}

export const getStoreById = async (id: string): Promise<PublicStore> => {
  const { data: resp } = await axiosInstance.get(`/stores/${id}`)
  return resp?.data as PublicStore
}
