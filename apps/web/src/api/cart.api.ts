import axiosInstance from './axiosInstance'

// ── Cart Types ─────────────────────────────────────────────────────────

export interface CartVariantImage {
  id: string
  url: string
  altText: string | null
  isPrimary: boolean
  sortOrder: number
}

export interface CartVariant {
  id: string
  sku: string
  price: number
  isActive: boolean
  image: CartVariantImage | null
  optionValues: { optionName: string; valueName: string }[]
  product: {
    id: string
    name: string
    slug: string
    frontImageUrl: string | null
    brand: { id: string; name: string; slug: string; logoUrl: string | null } | null
  }
}

export interface CartComboKit {
  id: string
  name: string
  slug: string
  price: number
  imageUrl: string | null
  isActive: boolean
}

export interface CartItem {
  id: string
  itemType: 'PRODUCT_VARIANT' | 'COMBO_KIT'
  quantity: number
  unitPrice: number
  lineTotal: number
  availableStock: number
  productVariantId: string | null
  comboKitId: string | null
  productVariant: CartVariant | null
  comboKit: CartComboKit | null
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  totalItems: number
  totalQuantity: number
  subtotal: number
  total: number
}

// ── Cart API ───────────────────────────────────────────────────────────

export const getCart = async (): Promise<Cart> => {
  const { data: resp } = await axiosInstance.get('/cart')
  return resp?.data as Cart
}

export const addToCart = async (payload: { productVariantId?: string; comboKitId?: string; quantity?: number }): Promise<Cart> => {
  const { data: resp } = await axiosInstance.post('/cart/items', payload)
  return resp?.data as Cart
}

export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> => {
  const { data: resp } = await axiosInstance.put(`/cart/items/${itemId}`, { quantity })
  return resp?.data as Cart
}

export const removeCartItem = async (itemId: string): Promise<Cart> => {
  const { data: resp } = await axiosInstance.delete(`/cart/items/${itemId}`)
  return resp?.data as Cart
}

export const clearCart = async (): Promise<Cart> => {
  const { data: resp } = await axiosInstance.delete('/cart')
  return resp?.data as Cart
}

// ── Order Types ────────────────────────────────────────────────────────

export interface ShippingAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  pincode: string
  phone: string
}

export interface OrderItem {
  id: string
  productId: string | null
  productVariantId: string | null
  comboKitId: string | null
  productName: string
  price: number
  quantity: number
  lineTotal: number
}

export interface Order {
  id: string
  userId: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED'
  subtotalAmount: number
  taxAmount: number
  discountAmount: number
  shippingAmount: number
  totalAmount: number
  items: OrderItem[]
  totalItems: number
  createdAt: string
  updatedAt: string
}

// ── Order API ──────────────────────────────────────────────────────────

export const createOrder = async (payload: {
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  couponCode?: string
}): Promise<{ order: Order; payment: any }> => {
  const { data: resp } = await axiosInstance.post('/orders', payload)
  return resp?.data as { order: Order; payment: any }
}

export const getMyOrders = async (): Promise<{ items: Order[]; pagination: any }> => {
  const { data: resp } = await axiosInstance.get('/orders')
  return resp?.data as { items: Order[]; pagination: any }
}

export const getOrderById = async (orderId: string): Promise<Order> => {
  const { data: resp } = await axiosInstance.get(`/orders/${orderId}`)
  return resp?.data as Order
}

export const cancelOrder = async (orderId: string): Promise<Order> => {
  const { data: resp } = await axiosInstance.put(`/orders/${orderId}/cancel`)
  return resp?.data as Order
}
