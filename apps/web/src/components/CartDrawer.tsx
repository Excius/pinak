import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/cart.api'
import type { ShippingAddress } from '../api/cart.api'

const emptyAddress: ShippingAddress = {
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
}

const CartDrawer: React.FC = () => {
  const navigate = useNavigate()
  const { items, itemCount, subtotal, isOpen, closeCart, updateQuantity, removeItem, clearCart, refreshCart } = useCart()

  const [showCheckout, setShowCheckout] = useState(false)
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  const getItemName = (item: typeof items[0]) => {
    if (item.itemType === 'COMBO_KIT' && item.comboKit) return item.comboKit.name
    if (item.productVariant?.product) return item.productVariant.product.name
    return 'Unknown Item'
  }

  const getItemImage = (item: typeof items[0]) => {
    if (item.itemType === 'COMBO_KIT' && item.comboKit) return item.comboKit.imageUrl
    if (item.productVariant?.image) return item.productVariant.image.url
    if (item.productVariant?.product?.frontImageUrl) return item.productVariant.product.frontImageUrl
    return null
  }

  const getItemVariantLabel = (item: typeof items[0]) => {
    if (item.productVariant?.optionValues?.length) {
      return item.productVariant.optionValues.map(o => `${o.optionName}: ${o.valueName}`).join(' · ')
    }
    return null
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }

  const canPlaceOrder = address.fullName && address.addressLine1 && address.city && address.state && address.pincode && address.phone

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return
    setPlacing(true)
    setError(null)
    try {
      const result = await createOrder({ shippingAddress: address })
      closeCart()
      setShowCheckout(false)
      setAddress(emptyAddress)
      await refreshCart()
      navigate(`/order-confirmation/${result.order.id}`)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to place order'
      setError(msg)
      console.error('Order failed', err)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={() => { closeCart(); setShowCheckout(false) }}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-[80] h-full w-full max-w-md bg-surface-dark border-l border-primary/10 shadow-2xl animate-slideRight flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-primary text-2xl">shopping_bag</span>
            <h2 className="font-display text-xl font-bold text-text-main-light">
              {showCheckout ? 'Checkout' : `Your Bag (${itemCount})`}
            </h2>
          </div>
          <button
            className="text-text-muted hover:text-primary transition-colors cursor-pointer active:scale-95"
            onClick={() => { closeCart(); setShowCheckout(false) }}
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <span className="material-icons-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {/* Checkout Form */}
        {showCheckout ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <p className="text-sm text-text-muted mb-2">Enter your shipping address to complete the order.</p>

            {[
              { name: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
              { name: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
              { name: 'addressLine1', label: 'Address Line 1', placeholder: '123 Main Street' },
              { name: 'addressLine2', label: 'Address Line 2 (Optional)', placeholder: 'Apt 4B' },
              { name: 'city', label: 'City', placeholder: 'Mumbai' },
              { name: 'state', label: 'State', placeholder: 'Maharashtra' },
              { name: 'pincode', label: 'Pincode', placeholder: '400001' },
            ].map(field => (
              <div key={field.name} className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{field.label}</label>
                <input
                  name={field.name}
                  value={(address as any)[field.name] || ''}
                  onChange={handleAddressChange}
                  placeholder={field.placeholder}
                  className="w-full bg-background-light border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}

            {/* Order Summary mini */}
            <div className="mt-4 p-4 bg-background-light rounded-xl border border-primary/10">
              <p className="text-xs font-bold text-text-muted uppercase mb-2">Order Summary</p>
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span className="text-text-main-light truncate flex-1 mr-2">{getItemName(item)} × {item.quantity}</span>
                  <span className="text-primary font-mono shrink-0">{formatPrice(item.lineTotal)}</span>
                </div>
              ))}
              <div className="border-t border-primary/10 mt-2 pt-2 flex justify-between">
                <span className="text-sm font-bold text-text-main-light">Total</span>
                <span className="text-lg font-bold text-primary">{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Cart Items */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-icons-outlined text-primary text-4xl">shopping_bag</span>
                </div>
                <p className="text-text-muted">Your bag is empty</p>
                <button
                  className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer"
                  onClick={() => {
                    closeCart()
                    navigate('/shop')
                  }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl bg-background-light border border-primary/5 hover:border-primary/15 transition-colors"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg bg-surface-dark overflow-hidden shrink-0 border border-primary/10">
                    {getItemImage(item) ? (
                      <img src={getItemImage(item)!} alt={getItemName(item)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-outlined text-text-muted">image</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-text-main-light truncate">
                      {getItemName(item)}
                    </h4>
                    {getItemVariantLabel(item) && (
                      <p className="text-xs text-text-muted mt-0.5">{getItemVariantLabel(item)}</p>
                    )}
                    {item.itemType === 'COMBO_KIT' && (
                      <p className="text-[10px] text-primary/60 mt-0.5">Combo Kit</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">{formatPrice(item.unitPrice)}</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="w-7 h-7 rounded-full border border-primary/20 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <span className="material-icons-outlined text-sm">remove</span>
                      </button>
                      <span className="text-sm font-semibold text-text-main-light w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="w-7 h-7 rounded-full border border-primary/20 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <span className="material-icons-outlined text-sm">add</span>
                      </button>
                      <button
                        className="ml-auto text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                        onClick={() => removeItem(item.id)}
                      >
                        <span className="material-icons-outlined text-lg">delete_outline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-primary/10 space-y-3">
            {!showCheckout && (
              <div className="flex justify-between items-center">
                <span className="text-text-muted font-medium">Subtotal</span>
                <span className="text-xl font-bold text-primary">{formatPrice(subtotal)}</span>
              </div>
            )}

            {showCheckout ? (
              <>
                <button
                  className="w-full bg-primary hover:bg-primary-hover text-black py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all glow-gold cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canPlaceOrder || placing}
                  onClick={handlePlaceOrder}
                >
                  {placing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Placing Order...
                    </span>
                  ) : (
                    `Place Order — ${formatPrice(subtotal)}`
                  )}
                </button>
                <button
                  className="w-full text-text-muted hover:text-primary text-sm font-medium transition-colors cursor-pointer"
                  onClick={() => setShowCheckout(false)}
                >
                  ← Back to Bag
                </button>
              </>
            ) : (
              <>
                <button
                  className="w-full bg-primary hover:bg-primary-hover text-black py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all glow-gold cursor-pointer active:scale-[0.98]"
                  onClick={() => setShowCheckout(true)}
                >
                  Checkout — {formatPrice(subtotal)}
                </button>
                <button
                  className="w-full text-text-muted hover:text-red-400 text-sm font-medium transition-colors cursor-pointer"
                  onClick={clearCart}
                >
                  Clear Bag
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer
