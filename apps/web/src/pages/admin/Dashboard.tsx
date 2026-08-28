import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBestsellers, getBestsellerAnalytics } from '../../api/products.api'
import type { Product, BestsellerAnalytics } from '../../api/products.api'
type Timeframe = 'all_time' | 'month' | 'week'

const AdminDashboard: React.FC = () => {
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<BestsellerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeframe, setTimeframe] = useState<Timeframe>('all_time')

  useEffect(() => {
    const fetchBestsellers = async () => {
      setLoading(true)
      setError('')
      try {
        const [data, analyticsData] = await Promise.all([
          getBestsellers({ timeframe, limit: 10 }),
          getBestsellerAnalytics(timeframe)
        ])
        setBestsellers(Array.isArray(data) ? data : [])
        setAnalytics(analyticsData)
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch best sellers')
      } finally {
        setLoading(false)
      }
    }
    fetchBestsellers()
  }, [timeframe])

  const getFirstVariant = (product: Product) => {
    const variants = product.variants || []
    return variants.find((v) => v.isActive) || variants[0]
  }

  const getProductImage = (product: Product) => {
    if (product.frontImageUrl) return product.frontImageUrl
    const variant = getFirstVariant(product)
    return variant?.image?.url || ''
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-background-light rounded-2xl p-8 border border-primary/10 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-bold text-text-main-light mb-2">
            Best Sellers Dashboard
          </h1>
          <p className="text-text-muted">
            Track your top-performing products, sales volume, and customer interest.
          </p>
        </div>

        {/* Timeframe Filters */}
        <div className="relative z-10 flex bg-background-main p-1 rounded-xl border border-primary/10 self-start md:self-auto">
          {(['week', 'month', 'all_time'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 text-sm font-bold rounded-lg capitalize transition-all cursor-pointer ${timeframe === tf
                  ? 'bg-primary text-black shadow-md shadow-primary/20'
                  : 'text-text-muted hover:text-primary hover:bg-primary/5'
                }`}
            >
              {tf.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background-light p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text-muted uppercase tracking-widest">Total Units Sold</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-icons-outlined">shopping_bag</span>
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-text-main-light">{analytics?.totalUnitsSold?.toLocaleString() || '-'}</p>
        </div>
        
        <div className="bg-background-light p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text-muted uppercase tracking-widest">Gross Revenue</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-icons-outlined">payments</span>
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-primary price-glow">{analytics ? formatPrice(analytics.grossRevenue) : '-'}</p>
        </div>

        <div className="bg-background-light p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text-muted uppercase tracking-widest">Top Category</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-icons-outlined">category</span>
            </div>
          </div>
          <p className="text-xl font-display font-bold text-text-main-light truncate">{analytics?.topCategory || '-'}</p>
        </div>

        <div className="bg-background-light p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text-muted uppercase tracking-widest">Active Period</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-icons-outlined">date_range</span>
            </div>
          </div>
          <p className="text-xl font-display font-bold text-text-main-light capitalize">{analytics?.timeframe?.replace('_', ' ') || '-'}</p>
        </div>
      </div>

      <div className="bg-background-light rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-primary/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-main-light">Top Products ({timeframe.replace('_', ' ')})</h2>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-muted font-medium">Loading best sellers...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
            <span className="material-icons-outlined text-4xl text-red-400">error_outline</span>
            <div>
              <p className="text-red-400 font-bold mb-1">Failed to load data</p>
              <p className="text-sm text-text-muted">{error}</p>
            </div>
            <button
              onClick={() => setTimeframe(timeframe)}
              className="mt-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : bestsellers.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-icons-outlined text-3xl text-primary">inventory_2</span>
            </div>
            <div>
              <p className="text-text-main-light font-bold text-lg mb-1">No sales data found</p>
              <p className="text-sm text-text-muted max-w-md">
                There are no best selling products for the selected timeframe. Try changing the filter or wait for more customer orders.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 bg-background-main/50">
                  <th className="p-4 font-bold text-xs uppercase tracking-widest text-text-muted">Product</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest text-text-muted">Category</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest text-text-muted text-right">Units Sold</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest text-text-muted text-right">Views</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest text-text-muted text-right">Base Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {bestsellers.map((product) => {
                  const variant = getFirstVariant(product)
                  const img = getProductImage(product)
                  const categoryName = product.categories?.[0]?.name || 'Uncategorized'

                  return (
                    <tr key={product.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-4">
                        <Link to={`/admin/products/${product.id}`} className="flex items-center gap-4 cursor-pointer">
                          <div className="w-12 h-12 rounded-lg bg-surface-dark border border-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {img ? (
                              <img src={img} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-icons-outlined text-text-muted/50">image</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-text-main-light group-hover:text-primary transition-colors line-clamp-1">{product.name}</p>
                            <p className="text-xs text-text-muted font-mono mt-0.5">{variant?.sku || 'No SKU'}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-elevated text-xs font-medium text-text-muted border border-primary/10">
                          {categoryName}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5 font-bold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-lg">
                          <span className="material-icons-outlined text-[14px]">trending_up</span>
                          {product.purchasedCount.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5 text-text-main-light font-medium">
                          <span className="material-icons-outlined text-[14px] text-text-muted">visibility</span>
                          {product.viewCount.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-primary">
                            {formatPrice(variant?.priceWithTax ?? variant?.price ?? 0)}
                          </span>
                          <span className="text-[10px] text-text-muted uppercase">incl. tax</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
