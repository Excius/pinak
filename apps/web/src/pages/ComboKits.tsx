import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Skeleton } from '../components/Skeleton'
import { getComboKits } from '../api/combos.api'
import type { ComboKit } from '../api/combos.api'

const ComboKits: React.FC = () => {
  const navigate = useNavigate()
  const [combos, setCombos] = useState<ComboKit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCombos = async () => {
      setLoading(true)
      try {
        const data = await getComboKits()
        setCombos(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load combo kits')
      } finally {
        setLoading(false)
      }
    }
    fetchCombos()
  }, [])

  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <a className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</a>
          <span className="material-icons-outlined text-xs">chevron_right</span>
          <span className="text-text-main-light">Combo Kits</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm uppercase tracking-widest font-bold block mb-2">Save More</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Combo Kits</h1>
          <p className="text-text-muted max-w-xl mx-auto">
            Curated bundles of our best products, specially priced for the ultimate beauty ritual.
          </p>
        </div>

        {/* Combos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 border border-red-800/50">
              <span className="material-icons-outlined text-3xl text-red-400">error</span>
            </div>
            <p className="text-text-muted">{error}</p>
          </div>
        ) : combos.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
              <span className="material-icons-outlined text-3xl text-primary">inventory_2</span>
            </div>
            <p className="text-text-muted">No combo kits available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {combos.map((combo) => (
              <div
                key={combo.id}
                className="group bg-surface-dark rounded-2xl overflow-hidden border border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                onClick={() => navigate(`/combo-kits/${combo.slug}`)}
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden relative">
                  {combo.imageUrl ? (
                    <img
                      src={combo.imageUrl}
                      alt={combo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-elevated">
                      <span className="material-icons-outlined text-6xl text-text-muted/30">redeem</span>
                    </div>
                  )}
                  {combo.discountValue && (
                    <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold">
                      Save {combo.discountType === 'PERCENTAGE' ? `${combo.discountValue}%` : formatPrice(combo.discountValue)}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur px-3 py-1 rounded-full text-black text-xs font-bold">
                    {combo.items?.length || 0} Items
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 space-y-3">
                  <h3 className="font-display text-xl font-bold group-hover:text-primary transition-colors">
                    {combo.name}
                  </h3>
                  {combo.description && (
                    <p className="text-sm text-text-muted line-clamp-2">{combo.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-primary">{formatPrice(combo.price)}</span>
                    <span className="text-xs text-text-muted">
                      {combo.purchasedCount > 0 && `${combo.purchasedCount} sold`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ComboKits
