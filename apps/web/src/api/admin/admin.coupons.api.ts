import  axiosInstance  from '../axiosInstance'

export interface AdminCoupon {
  id: string
  code: string
  discountType: 'PERCENTAGE' | 'FLAT'
  discountValue: number
  minOderValue: number | null
  maxDiscountValue: number | null
  validFrom: string
  validUntil: string
  maxTotalUsers: number | null
  maxUsesPerUser: number | null
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminCouponListParams {
  deleted?: boolean
  page?: number
  limit?: number
  isActive?: boolean
  search?: string
}

export const getAllCouponsAdmin = async (params?: AdminCouponListParams) => {
  const { data } = await axiosInstance.get('/coupons/admin', {
    params: params ? { ...params, isActive: params.isActive === undefined ? undefined : String(params.isActive) } : undefined,
  })
  // Backend envelope: { items, pagination: { total, page, limit, totalPages } }
  const pg = data?.data?.pagination ?? {}
  return {
    items: (data?.data?.items || []) as AdminCoupon[],
    total: (pg.total as number) || 0,
    page: (pg.page as number) || 1,
    limit: (pg.limit as number) || 20,
    totalPages: (pg.totalPages as number) || 1,
  }
}

export const createCouponAdmin = async (payload: Partial<AdminCoupon>): Promise<AdminCoupon> => {
  const { data } = await axiosInstance.post('/coupons/admin', payload)
  return data.data
}

export const updateCouponAdmin = async (id: string, payload: Partial<AdminCoupon>): Promise<AdminCoupon> => {
  const { data } = await axiosInstance.put(`/coupons/admin/${id}`, payload)
  return data.data
}

export const updateCouponStatusAdmin = async (id: string, isActive: boolean): Promise<AdminCoupon> => {
  const { data } = await axiosInstance.put(`/coupons/admin/${id}/status`, { isActive })
  return data.data
}

export const softDeleteCouponAdmin = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/coupons/admin/${id}/soft`)
}

export const restoreCouponAdmin = async (id: string): Promise<void> => {
  await axiosInstance.put(`/coupons/admin/${id}/restore`)
}

export const hardDeleteCouponAdmin = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/coupons/admin/${id}/hard`)
}
