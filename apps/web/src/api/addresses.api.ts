import axiosInstance from './axiosInstance'

// ── Types ──────────────────────────────────────────────────────────────

export interface Address {
  id: string
  userId: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAddressPayload {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country?: string
}

export interface UpdateAddressPayload {
  fullName?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string | null
  city?: string
  state?: string
  pincode?: string
  country?: string
}

// ── API ────────────────────────────────────────────────────────────────

export const getAddresses = async (): Promise<Address[]> => {
  const { data: resp } = await axiosInstance.get('/addresses')
  const result = resp?.data
  return Array.isArray(result) ? result : (result?.items || [])
}

export const getAddressById = async (id: string): Promise<Address> => {
  const { data: resp } = await axiosInstance.get(`/addresses/${id}`)
  return resp?.data as Address
}

export const createAddress = async (payload: CreateAddressPayload): Promise<Address> => {
  const { data: resp } = await axiosInstance.post('/addresses', payload)
  return resp?.data as Address
}

export const updateAddress = async (id: string, payload: UpdateAddressPayload): Promise<Address> => {
  const { data: resp } = await axiosInstance.patch(`/addresses/${id}`, payload)
  return resp?.data as Address
}

export const deleteAddress = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/addresses/${id}`)
}

export const setDefaultAddress = async (id: string): Promise<Address> => {
  const { data: resp } = await axiosInstance.patch(`/addresses/${id}/default`)
  return resp?.data as Address
}
