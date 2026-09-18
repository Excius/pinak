import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

const CartDrawer: React.FC = () => {
  const navigate = useNavigate()
  const { items, itemCount, subtotal, taxTotal, totalWithTax, isOpen, closeCart, updateQuantity, removeItem, clearCart } = useCart()

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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={() => closeCart()}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-[80] h-full w-full max-w-md bg-surface-dark border-l border-primary/10 shadow-2xl animate-slideRight flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-primary text-2xl">shopping_bag</span>
            <h2 className="font-display text-xl font-bold text-text-main-light">
              Your Bag ({itemCount})
            </h2>
          </div>
          <button
            className="text-text-muted hover:text-primary transition-colors cursor-pointer active:scale-95"
            onClick={() => closeCart()}
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        {/* Cart Items */}
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
                      <span className="text-sm font-bold text-primary">{formatPrice(item.unitPriceWithTax ?? item.unitPrice)}</span>
                      {item.unitPriceWithTax !== undefined && (
                        <span className="text-[10px] text-text-muted">(incl. tax)</span>
                      )}
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
                        onClick={() => {
                          const maxStock = item.availableStock ?? Infinity;
                          if (item.quantity >= maxStock) {
                            toast.error(`Only ${maxStock} items available in stock.`);
                          } else {
                            updateQuantity(item.id, item.quantity + 1);
                          }
                        }}
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-primary/10 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted font-medium">Subtotal (excl. tax)</span>
              <span className="font-bold text-text-main-light">{formatPrice(subtotal)}</span>
            </div>
            {taxTotal !== undefined && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted font-medium">Tax</span>
                <span className="font-bold text-text-main-light">{formatPrice(taxTotal)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-primary/5">
              <span className="text-text-muted font-medium">Total</span>
              <span className="text-xl font-bold text-primary">{formatPrice(totalWithTax ?? subtotal)}</span>
            </div>
            <button
              className="w-full bg-primary hover:bg-primary-hover text-black py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all glow-gold cursor-pointer active:scale-[0.98] mt-2"
              onClick={() => { closeCart(); navigate('/checkout') }}
            >
              Proceed to Checkout — {formatPrice(totalWithTax ?? subtotal)}
            </button>
            <button
              className="w-full text-text-muted hover:text-red-400 text-sm font-medium transition-colors cursor-pointer"
              onClick={clearCart}
            >
              Clear Bag
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer
