import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import * as cartApi from '../api/cart.api'
import type { Cart, CartItem } from '../api/cart.api'

interface CartContextType {
  cart: Cart | null
  items: CartItem[]
  itemCount: number
  subtotal: number
  taxTotal: number
  totalWithTax: number
  loading: boolean
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (payload: { productVariantId?: string; comboKitId?: string; quantity?: number }) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const items = cart?.items ?? []
  const itemCount = cart?.totalQuantity ?? 0
  const subtotal = cart?.subtotal ?? 0
  const taxTotal = cart?.taxTotal ?? 0
  const totalWithTax = cart?.totalWithTax ?? subtotal

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((p) => !p), [])

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }
    try {
      setLoading(true)
      const data = await cartApi.getCart()
      setCart(data)
    } catch (err) {
      console.error('Failed to fetch cart', err)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Fetch cart on login / page load
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart()
    } else {
      setCart(null)
    }
  }, [isAuthenticated, refreshCart])

  const addItem = useCallback(async (payload: { productVariantId?: string; comboKitId?: string; quantity?: number }) => {
    try {
      const updated = await cartApi.addToCart(payload)
      setCart(updated)
      setIsOpen(true)
    } catch (err) {
      console.error('Failed to add to cart', err)
    }
  }, [])

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const updated = await cartApi.removeCartItem(itemId)
      setCart(updated)
    } catch (err) {
      console.error('Failed to remove from cart', err)
    }
  }, [])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }
    try {
      const updated = await cartApi.updateCartItem(itemId, quantity)
      setCart(updated)
    } catch (err) {
      console.error('Failed to update cart', err)
    }
  }, [removeItem])

  const clearCartFn = useCallback(async () => {
    try {
      const updated = await cartApi.clearCart()
      setCart(updated)
    } catch (err) {
      console.error('Failed to clear cart', err)
    }
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        taxTotal,
        totalWithTax,
        loading,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart: clearCartFn,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
