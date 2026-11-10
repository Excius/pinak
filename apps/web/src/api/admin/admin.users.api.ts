import axiosInstance from '../axiosInstance'

export type UserRole = 'ADMIN' | 'MODERATOR' | 'USER'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

export interface AdminUserSummary {
  id: string
  email: string
  username: string
  name: string | null
  role: UserRole
  status: UserStatus
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
  orderCount: number
  /** Paise actually paid (completed, not cancelled). */
  totalSpent: number
}

export interface AdminUserAddress {
  id: string
  fullName: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  pincode: string
  phone: string
  label?: string | null
  isDefault: boolean
}

export interface AdminUserDetail extends Omit<AdminUserSummary, 'orderCount' | 'totalSpent'> {
  addresses: AdminUserAddress[]
  authProviders: { provider: string; createdAt: string }[]
  orders: { id: string; status: string; paymentStatus: string; totalAmount: number; createdAt: string }[]
  stats: { orderCount: number; totalSpent: number; activeSessions: number }
}

export interface AdminUserListParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: UserStatus
  sortBy?: 'createdAt' | 'name' | 'email'
  sortOrder?: 'asc' | 'desc'
}

export interface AdminUserListResult {
  items: AdminUserSummary[]
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }
}

export const listUsersAdmin = async (params?: AdminUserListParams): Promise<AdminUserListResult> => {
  const { data: resp } = await axiosInstance.get('/users/admin', { params })
  return resp?.data as AdminUserListResult
}

/** Admin only. Deactivating signs the user out everywhere; ACTIVE also restores a deleted account. */
export const setUserStatusAdmin = async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<{ id: string; status: UserStatus }> => {
  const { data: resp } = await axiosInstance.patch(`/users/admin/${id}/status`, { status })
  return resp?.data
}

/** Admin only. Soft delete: the account can no longer sign in and is hidden from the default list. */
export const deleteUserAdmin = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/users/admin/${id}`)
}

export const getUserAdmin = async (id: string): Promise<AdminUserDetail> => {
  const { data: resp } = await axiosInstance.get(`/users/admin/${id}`)
  return resp?.data as AdminUserDetail
}
