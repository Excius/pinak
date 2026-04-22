import axiosInstance from './axiosInstance'

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  parent?: Category
  children?: Category[]
  categoryImages?: Array<{
    id: string
    url: string
    altText?: string
    isPrimary: boolean
  }>
  createdAt: string
  updatedAt: string
}

export const getCategories = async (): Promise<Category[]> => {
  const { data: resp } = await axiosInstance.get('/categories')
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.data || result?.categories || [])
}

export const getTopCategories = async (): Promise<Category[]> => {
  const { data: resp } = await axiosInstance.get('/categories/top')
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.data || result?.categories || [])
}

export const getCategoryTree = async (): Promise<Category[]> => {
  const { data: resp } = await axiosInstance.get('/categories/tree')
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.data || [])
}

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const { data: resp } = await axiosInstance.get(`/categories/slug/${slug}`)
  return resp?.data || resp
}

export const getCategoryById = async (id: string): Promise<Category> => {
  const { data: resp } = await axiosInstance.get(`/categories/${id}`)
  return resp?.data || resp
}
