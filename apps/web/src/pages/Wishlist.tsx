import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { ProductGridSkeleton } from '../components/Skeleton'
import { getWishlist, removeFromWishlist, clearWishlist as apiClearWishlist } from '../api/wishlist.api'
import { useCart } from '../context/CartContext'
import type { WishlistItem } from '../api/wishlist.api'

const Wishlist: React.FC = () => {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchWishlist = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getWishlist()
      setItems(data?.items || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromWishlist(itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch {
      // silently fail
    }
  }

  const handleClear = async () => {
    try {
      await apiClearWishlist()
      setItems([])
    } catch {
      // silently fail
    }
  }

  const handleMoveToBag = (item: WishlistItem) => {
    const variant = item.productVariant
    if (!variant) return
    addItem({
      id: variant.id,
      type: 'variant',
      productName: variant.product?.name || 'Product',
      variantLabel: variant.optionValues?.map((ov) => ov.optionValue.value).join(' / ') || '',
      imageUrl: variant.images?.find((img) => img.isPrimary)?.url || variant.images?.[0]?.url || variant.product?.frontImageUrl || '',
      price: variant.price,
      comparePrice: variant.comparePrice ?? undefined,
      slug: variant.product?.slug || '',
      productSlug: variant.product?.slug || '',
    })
    handleRemove(item.id)
  }

  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <a className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</a>
          <span className="material-icons-outlined text-xs">chevron_right</span>
          <span className="text-text-main-light">Wishlist</span>
        </div>

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">My Wishlist</h1>
            <p className="text-text-muted mt-2">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
          </div>
          {items.length > 0 && (
            <button
              className="text-text-muted hover:text-red-400 text-sm font-medium transition-colors cursor-pointer"
              onClick={handleClear}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : error ? (
          <div className="text-center py-20 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 border border-red-800/50">
              <span className="material-icons-outlined text-3xl text-red-400">error</span>
            </div>
            <p className="text-text-muted">{error}</p>
            <button
              className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer"
              onClick={fetchWishlist}
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20">
              <span className="material-icons-outlined text-4xl text-primary">favorite_border</span>
            </div>
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Your wishlist is empty</h3>
              <p className="text-text-muted">Save your favorite products to come back to them later</p>
            </div>
            <button
              className="bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all cursor-pointer"
              onClick={() => navigate('/shop')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item) => {
              const variant = item.productVariant
              const product = variant?.product
              const imageUrl =
                variant?.images?.find((img) => img.isPrimary)?.url ||
                variant?.images?.[0]?.url ||
                product?.frontImageUrl ||
                ''

              return (
                <div key={item.id} className="group">
                  <div
                    className="relative overflow-hidden rounded-2xl bg-surface-dark aspect-[3/4] mb-4 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all border border-primary/5 hover:border-primary/20 cursor-pointer"
                    onClick={() => product?.slug && navigate(`/products/${product.slug}`)}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-outlined text-6xl text-text-muted/30">image</span>
                      </div>
                    )}
                    <button
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(item.id)
                      }}
                    >
                      <span className="material-icons-outlined text-lg">close</span>
                    </button>
                  </div>
                  <h3
                    className="font-display text-lg font-semibold cursor-pointer hover:text-primary transition-colors truncate"
                    onClick={() => product?.slug && navigate(`/products/${product.slug}`)}
                  >
                    {product?.name || 'Product'}
                  </h3>
                  {variant?.optionValues && variant.optionValues.length > 0 && (
                    <p className="text-sm text-text-muted mb-2">
                      {variant.optionValues.map((ov) => ov.optionValue.value).join(' / ')}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {variant && <span className="font-bold text-lg text-primary">{formatPrice(variant.price)}</span>}
                      {variant?.comparePrice && variant.comparePrice > variant.price && (
                        <span className="text-sm text-text-muted line-through">{formatPrice(variant.comparePrice)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="w-full py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-black text-sm font-semibold transition-all cursor-pointer active:scale-95"
                    onClick={() => handleMoveToBag(item)}
                  >
                    Move to Bag
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Wishlist
