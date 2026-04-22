import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { ProductDetailSkeleton } from '../components/Skeleton'
import { getComboKitBySlug, getComboKitItems } from '../api/combos.api'
import { useCart } from '../context/CartContext'
import type { ComboKit, ComboKitItem } from '../api/combos.api'

const ComboKitDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [combo, setCombo] = useState<ComboKit | null>(null)
  const [items, setItems] = useState<ComboKitItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return
      setLoading(true)
      try {
        const comboData = await getComboKitBySlug(slug)
        setCombo(comboData)

        if (comboData?.id) {
          const itemsData = await getComboKitItems(comboData.id)
          setItems(Array.isArray(itemsData) ? itemsData : [])
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load combo kit')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`

  const handleAddComboToCart = () => {
    if (!combo) return
    addItem({
      id: combo.id,
      type: 'combo',
      productName: combo.name,
      variantLabel: `${items.length} items bundle`,
      imageUrl: combo.imageUrl || '',
      price: combo.price,
      slug: combo.slug,
      productSlug: combo.slug,
    })
  }

  const totalOriginalPrice = items.reduce((acc, item) => {
    return acc + (item.originalPrice || item.productVariant?.price || 0) * item.quantity
  }, 0)

  const savings = totalOriginalPrice > 0 && combo ? totalOriginalPrice - combo.price : 0

  if (loading) {
    return (
      <Layout>
        <ProductDetailSkeleton />
      </Layout>
    )
  }

  if (error || !combo) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 border border-red-800/50">
            <span className="material-icons-outlined text-3xl text-red-400">error</span>
          </div>
          <h2 className="font-display text-2xl font-bold">{error || 'Combo kit not found'}</h2>
          <button
            className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer"
            onClick={() => navigate('/combo-kits')}
          >
            Back to Combo Kits
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <a className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</a>
          <span className="material-icons-outlined text-xs">chevron_right</span>
          <a className="hover:text-primary cursor-pointer" onClick={() => navigate('/combo-kits')}>Combo Kits</a>
          <span className="material-icons-outlined text-xs">chevron_right</span>
          <span className="text-text-main-light truncate">{combo.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image */}
          <div className="w-full lg:w-1/2">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-dark border border-primary/10">
              {combo.imageUrl ? (
                <img src={combo.imageUrl} alt={combo.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-icons-outlined text-8xl text-text-muted/30">redeem</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="w-full lg:w-1/2 space-y-6">
            <span className="text-primary text-sm uppercase tracking-widest font-bold">Combo Kit</span>
            <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight">{combo.name}</h1>

            {combo.description && (
              <p className="text-text-muted leading-relaxed">{combo.description}</p>
            )}

            {/* Pricing */}
            <div className="bg-surface-dark rounded-2xl p-6 border border-primary/10 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">{formatPrice(combo.price)}</span>
                {totalOriginalPrice > combo.price && (
                  <span className="text-lg text-text-muted line-through">{formatPrice(totalOriginalPrice)}</span>
                )}
              </div>
              {savings > 0 && (
                <div className="flex items-center gap-2 text-green-400">
                  <span className="material-icons-outlined text-lg">savings</span>
                  <span className="font-bold">You save {formatPrice(savings)}</span>
                </div>
              )}
            </div>

            {/* Add to bag */}
            <button
              className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all glow-gold cursor-pointer active:scale-[0.98]"
              onClick={handleAddComboToCart}
            >
              Add Combo to Bag — {formatPrice(combo.price)}
            </button>

            {combo.tags && combo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {combo.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-surface-elevated text-text-muted text-xs border border-primary/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Included Items */}
        {items.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-12 bg-primary"></span>
              <h2 className="font-display text-2xl font-bold">What's Included ({items.length} items)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => {
                  const variant = item.productVariant
                  const product = variant?.product
                  const imageUrl =
                    variant?.images?.[0]?.url || product?.frontImageUrl || ''
                  const variantLabel =
                    variant?.optionValues?.map((ov) => ov.optionValue.value).join(' / ') || ''

                  return (
                    <div
                      key={item.id}
                      className="bg-surface-dark rounded-xl border border-primary/10 overflow-hidden hover:border-primary/20 transition-colors cursor-pointer"
                      onClick={() => product?.slug && navigate(`/products/${product.slug}`)}
                    >
                      <div className="flex gap-4 p-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-elevated shrink-0 border border-primary/5">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-icons-outlined text-text-muted">image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-text-main-light truncate">
                            {product?.name || 'Product'}
                          </h4>
                          {variantLabel && (
                            <p className="text-xs text-text-muted mt-0.5">{variantLabel}</p>
                          )}
                          <p className="text-xs text-text-muted mt-1">Qty: {item.quantity}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.discountedPrice != null && (
                              <span className="text-sm font-bold text-primary">
                                {formatPrice(item.discountedPrice)}
                              </span>
                            )}
                            {item.originalPrice != null && item.discountedPrice != null && item.originalPrice > item.discountedPrice && (
                              <span className="text-xs text-text-muted line-through">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}

export default ComboKitDetail
