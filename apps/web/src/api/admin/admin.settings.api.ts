import axiosInstance from '../axiosInstance'

// ── Tax Classes ────────────────────────────────────────────────────────

export interface TaxClass {
  id: string
  name: string
  rate: number
  createdAt?: string
  updatedAt?: string
}

export const getAllTaxClasses = async (): Promise<TaxClass[]> => {
  const { data: resp } = await axiosInstance.get('/tax-classes')
  return Array.isArray(resp?.data) ? resp.data : []
}

export const createTaxClass = async (payload: { name: string; rate: number }): Promise<TaxClass> => {
  const { data: resp } = await axiosInstance.post('/tax-classes/admin', payload)
  return resp?.data as TaxClass
}

export const updateTaxClass = async (id: string, payload: { name?: string; rate?: number }): Promise<TaxClass> => {
  const { data: resp } = await axiosInstance.put(`/tax-classes/admin/${id}`, payload)
  return resp?.data as TaxClass
}

export const deleteTaxClass = async (id: string) => {
  await axiosInstance.delete(`/tax-classes/admin/${id}`)
}

// ── Weight Classes ─────────────────────────────────────────────────────

export interface WeightClass {
  id: string
  name: string
  unit: string
  createdAt?: string
  updatedAt?: string
}

export const getAllWeightClasses = async (): Promise<WeightClass[]> => {
  const { data: resp } = await axiosInstance.get('/weight-classes')
  return Array.isArray(resp?.data) ? resp.data : []
}

export const createWeightClass = async (payload: { name: string; unit: string }): Promise<WeightClass> => {
  const { data: resp } = await axiosInstance.post('/weight-classes/admin', payload)
  return resp?.data as WeightClass
}

export const updateWeightClass = async (id: string, payload: { name?: string; unit?: string }): Promise<WeightClass> => {
  const { data: resp } = await axiosInstance.put(`/weight-classes/admin/${id}`, payload)
  return resp?.data as WeightClass
}

export const deleteWeightClass = async (id: string) => {
  await axiosInstance.delete(`/weight-classes/admin/${id}`)
}

// ── Length Classes ──────────────────────────────────────────────────────

export interface LengthClass {
  id: string
  name: string
  unit: string
  createdAt?: string
  updatedAt?: string
}

export const getAllLengthClasses = async (): Promise<LengthClass[]> => {
  const { data: resp } = await axiosInstance.get('/length-classes')
  return Array.isArray(resp?.data) ? resp.data : []
}

export const createLengthClass = async (payload: { name: string; unit: string }): Promise<LengthClass> => {
  const { data: resp } = await axiosInstance.post('/length-classes/admin', payload)
  return resp?.data as LengthClass
}

export const updateLengthClass = async (id: string, payload: { name?: string; unit?: string }): Promise<LengthClass> => {
  const { data: resp } = await axiosInstance.put(`/length-classes/admin/${id}`, payload)
  return resp?.data as LengthClass
}

export const deleteLengthClass = async (id: string) => {
  await axiosInstance.delete(`/length-classes/admin/${id}`)
}
