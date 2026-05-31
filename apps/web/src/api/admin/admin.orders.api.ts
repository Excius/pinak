import axiosInstance from '../axiosInstance'

// ── Types ──────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export interface AdminOrderItem {
  id: string
  productId: string | null
  productVariantId: string | null
  comboKitId: string | null
  productName: string
  variantDetails: any
  price: number
  quantity: number
  lineTotal: number
  product?: {
    id: string
    name: string
    brand?: { id: string; name: string } | null
  } | null
  productVariant?: {
    id: string
    sku: string
    price: number
    images?: { id: string; url: string; altText: string | null; isPrimary: boolean }[]
    optionValues?: { optionValue: { value: string; option: { name: string } } }[]
  } | null
  comboKit?: {
    id: string
    name: string
  } | null
}

export interface AdminOrder {
  id: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotalAmount: number
  taxAmount: number
  discountAmount: number
  shippingAmount: number
  totalAmount: number
  totalItems: number
  items: AdminOrderItem[]
  user?: {
    id: string
    name: string | null
    email: string
    phone: string | null
  }
  createdAt: string
  updatedAt: string
}

export interface AdminOrderListParams {
  page?: number
  limit?: number
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  userId?: string
}

// ── Order List ─────────────────────────────────────────────────────────

export const listOrdersAdmin = async (params?: AdminOrderListParams) => {
  const { data: resp } = await axiosInstance.get('/orders/admin', { params })
  return {
    items: (resp?.data?.orders || []) as AdminOrder[],
    pagination: resp?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  }
}

// ── Update Order Status ────────────────────────────────────────────────

export const updateOrderStatusAdmin = async (id: string, status: OrderStatus): Promise<AdminOrder> => {
  const { data: resp } = await axiosInstance.put(`/orders/admin/${id}/status`, { status })
  return resp?.data as AdminOrder
}

// ── Update Payment Status ──────────────────────────────────────────────

export const updatePaymentStatusAdmin = async (id: string, paymentStatus: PaymentStatus): Promise<AdminOrder> => {
  const { data: resp } = await axiosInstance.put(`/orders/admin/${id}/payment`, { paymentStatus })
  return resp?.data as AdminOrder
}

// ── Hard Delete Order ──────────────────────────────────────────────────

export const hardDeleteOrderAdmin = async (id: string) => {
  await axiosInstance.delete(`/orders/admin/${id}/hard`)
}
