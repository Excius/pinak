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
  const [selectedImage, setSelectedImage] = useState<string>('')

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
      comboKitId: combo.id,
      quantity: 1
    })
  }

  const totalOriginalPrice = items.reduce((acc, item) => {
    return acc + (item.originalPrice || item.productVariant?.price || 0) * item.quantity
  }, 0)

  const savings = totalOriginalPrice > 0 && combo ? totalOriginalPrice - combo.price : 0

  const allImages: string[] = []
  if (combo?.imageUrl) allImages.push(combo.imageUrl)
  items.forEach(item => {
    const variant = item.productVariant
    const product = variant?.product
    const imageUrl = variant?.images?.[0]?.url || product?.frontImageUrl
    if (imageUrl && !allImages.includes(imageUrl)) {
      allImages.push(imageUrl)
    }
  })

  useEffect(() => {
    if (combo?.imageUrl) {
      setSelectedImage(combo.imageUrl)
    } else if (allImages.length > 0) {
      setSelectedImage(allImages[0] ?? '')
    }
  }, [combo, items.length])

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
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-dark border border-primary/10 relative">
              {selectedImage ? (
                <img src={selectedImage} alt={combo.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-icons-outlined text-8xl text-text-muted/30">redeem</span>
                </div>
              )}
              {combo.imageUrl === selectedImage && (
                <div className="absolute top-4 left-4 bg-primary text-black text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                  Combo Kit
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImage === url
                        ? 'border-primary shadow-lg shadow-primary/20'
                        : 'border-primary/10 hover:border-primary/30'
                    }`}
                    onClick={() => setSelectedImage(url)}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div>
              <span className="text-primary text-sm uppercase tracking-widest font-bold">Value Bundle</span>
              <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight mt-2">{combo.name}</h1>
              {combo.description && (
                <p className="text-text-muted leading-relaxed mt-4">{combo.description}</p>
              )}
            </div>

            {/* What's Included */}
            {items.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-widest text-primary/70 uppercase border-b border-primary/10 pb-2">
                  What's Included
                </h3>
                <div className="space-y-3">
                  {items
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => {
                      const variant = item.productVariant
                      const product = variant?.product
                      const imageUrl = variant?.images?.[0]?.url || product?.frontImageUrl || ''
                      const variantLabel = variant?.optionValues?.map((ov: any) => ov?.optionValue?.value || ov?.valueName || ov?.value).filter(Boolean).join(' / ') || ''
                      
                      return (
                        <div 
                          key={item.id} 
                          className="flex gap-4 items-center p-3 bg-surface-dark rounded-xl border border-primary/5 hover:border-primary/20 transition-colors cursor-pointer"
                          onClick={() => product?.slug && navigate(`/products/${product.slug}`)}
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-elevated shrink-0">
                            {imageUrl ? (
                              <img src={imageUrl} alt={product?.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-icons-outlined text-text-muted text-sm">image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-text-main-light truncate">{product?.name || 'Product'}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {variantLabel && <span className="text-xs text-text-muted">{variantLabel}</span>}
                              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {item.discountedPrice != null && (
                              <p className="text-sm font-bold text-primary">{formatPrice(item.discountedPrice)}</p>
                            )}
                            {item.originalPrice != null && item.discountedPrice != null && item.originalPrice > item.discountedPrice && (
                              <p className="text-xs text-text-muted line-through">{formatPrice(item.originalPrice)}</p>
                            )}
                          </div>
                        </div>
                      )
                  })}
                </div>
              </div>
            )}

            {/* Pricing & Add to Cart */}
            <div className="bg-surface-dark rounded-2xl p-6 border border-primary/10 space-y-5">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-primary">{formatPrice(combo.price)}</span>
                  {totalOriginalPrice > combo.price && (
                    <span className="text-lg text-text-muted line-through">{formatPrice(totalOriginalPrice)}</span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-sm text-green-400 font-bold flex items-center gap-1.5">
                    <span className="material-icons-outlined text-sm">local_offer</span>
                    Total value {formatPrice(totalOriginalPrice)} — You save {formatPrice(savings)}
                  </p>
                )}
              </div>

              <button
                className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all glow-gold cursor-pointer active:scale-[0.98]"
                onClick={handleAddComboToCart}
              >
                Add Combo to Bag
              </button>
            </div>

            {combo.tags && combo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {combo.tags.map((tag, i) => (
                   <span key={i} className="px-3 py-1 rounded-full bg-surface-elevated text-text-muted text-xs border border-primary/5">
                     #{tag}
                   </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ComboKitDetail
