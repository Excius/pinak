import axiosInstance from './axiosInstance'

export interface FilterValue {
  id: string
  name: string
  slug: string
  sortOrder: number
}

export interface FilterGroup {
  id: string
  name: string
  slug: string
  sortOrder: number
  isActive: boolean
  values: FilterValue[]
}

export const getFilterGroups = async (): Promise<FilterGroup[]> => {
  const { data } = await axiosInstance.get('/filters/groups')
  return data.data || []
}

export default {
  getFilterGroups,
}
