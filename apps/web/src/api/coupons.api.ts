import axiosInstance from './axiosInstance'

// ── Types ──────────────────────────────────────────────────────────────

export interface CouponValidation {
  valid: boolean
  coupon?: {
    code: string
    discountType: 'PERCENTAGE' | 'FIXED'
    discountValue: number
    minOrderAmount?: number
    maxDiscountAmount?: number
  }
  discountAmount?: number
  message?: string
}

// ── API ────────────────────────────────────────────────────────────────

export const validateCoupon = async (code: string, cartTotal: number): Promise<CouponValidation> => {
  const { data: resp } = await axiosInstance.post('/coupons/validate', { code, cartTotal })
  return resp?.data as CouponValidation
}
