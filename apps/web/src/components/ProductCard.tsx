import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  imageUrl?: string
  price?: number
  priceWithTax?: number
  comparePrice?: number
  compareAtPriceWithTax?: number | null
  category?: string
  badge?: string
  rating?: number
  variantId?: string
  variantLabel?: string
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  slug,
  imageUrl,
  price,
  priceWithTax,
  comparePrice,
  compareAtPriceWithTax,
  category,
  badge,
  rating,
  variantId,
  variantLabel: _variantLabel,
}) => {
  const navigate = useNavigate()
  const { addItem } = useCart()

  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`

  const displayPrice = priceWithTax ?? price
  const displayComparePrice = compareAtPriceWithTax ?? comparePrice

  const discount =
    displayComparePrice && displayPrice && displayComparePrice > displayPrice
      ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)
      : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!variantId) return
    addItem({
      productVariantId: variantId,
      quantity: 1
    })
  }

  const renderStars = (r: number) => {
    const stars = []
    const full = Math.floor(r)
    const half = r - full >= 0.5
    for (let i = 0; i < full; i++) {
      stars.push(
        <span key={`full-${i}`} className="material-icons-outlined text-sm">
          star
        </span>
      )
    }
    if (half) {
      stars.push(
        <span key="half" className="material-icons-outlined text-sm">
          star_half
        </span>
      )
    }
    const empty = 5 - full - (half ? 1 : 0)
    for (let i = 0; i < empty; i++) {
      stars.push(
        <span key={`empty-${i}`} className="material-icons-outlined text-sm">
          star_border
        </span>
      )
    }
    return stars
  }

  return (
    <div className="group cursor-pointer card-lift" onClick={() => navigate(`/products/${slug}`)}>
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-surface-dark aspect-[3/4] mb-3 sm:mb-4 shadow-sm transition-all border border-primary/5 hover:border-primary/20 img-zoom">
        {imageUrl ? (
          <img
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src={imageUrl}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-dark">
            <span className="material-icons-outlined text-6xl text-text-muted/30">image</span>
          </div>
        )}
        {badge && (
          <div className="absolute top-3 left-3 badge-shimmer backdrop-blur px-3 py-1 text-xs uppercase font-bold tracking-wide rounded-full text-black">
            {badge}
          </div>
        )}
        {discount && (
          <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur px-2 py-1 text-xs font-bold rounded-full text-white">
            -{discount}%
          </div>
        )}
        {variantId && displayPrice && (
          <button
            className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-primary p-2.5 sm:p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 touch-show transition-all duration-300 hover:bg-primary-hover cursor-pointer active:scale-95"
            onClick={handleAddToCart}
          >
            <span className="material-icons-outlined text-xl text-black">add_shopping_cart</span>
          </button>
        )}
      </div>
      <h3 className="font-display text-sm sm:text-lg font-semibold hover:text-primary transition-colors truncate">
        {name}
      </h3>
      {category && <p className="text-xs sm:text-sm text-text-muted mb-1 sm:mb-2">{category}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {displayPrice != null && (
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-lg text-primary price-glow">
                {formatPrice(displayPrice)}
              </span>
              <span className="text-[10px] text-text-muted">(incl. tax)</span>
            </div>
          )}
          {displayComparePrice && displayComparePrice > (displayPrice || 0) && (
            <span className="text-xs sm:text-sm text-text-muted line-through mb-4">
              {formatPrice(displayComparePrice)}
            </span>
          )}
        </div>
        {rating != null && <div className="flex text-primary text-xs self-start">{renderStars(rating)}</div>}
      </div>
    </div>
  )
}

export default ProductCard
