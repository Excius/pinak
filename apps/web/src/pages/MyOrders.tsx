import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { getMyOrders } from '../api/cart.api'
import type { Order } from '../api/cart.api'

type StatusFilter = 'ALL' | 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DELIVERED: 'bg-green-500/10 text-green-400 border-green-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const statusIcons: Record<string, string> = {
  PENDING: 'schedule', PROCESSING: 'sync', SHIPPED: 'local_shipping',
  DELIVERED: 'check_circle', CANCELLED: 'cancel',
}

const paymentColors: Record<string, string> = {
  PENDING: 'text-yellow-400', COMPLETED: 'text-green-400', FAILED: 'text-red-400',
}

const MyOrders: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('ALL')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMyOrders()
      setOrders(data.items || [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)
  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const filters: StatusFilter[] = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  return (
    <Layout>
      <div className="min-h-screen bg-background-light">
        {/* Header */}
        <div className="bg-surface-dark border-b border-primary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
              <a className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</a>
              <span className="material-icons-outlined text-xs">chevron_right</span>
              <a className="hover:text-primary cursor-pointer" onClick={() => navigate('/profile')}>Profile</a>
              <span className="material-icons-outlined text-xs">chevron_right</span>
              <span className="text-text-main-light">My Orders</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-main-light">My Orders</h1>
            <p className="text-text-muted text-sm mt-1">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20'
                    : 'bg-surface-dark text-text-muted border-primary/10 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {f === 'ALL' ? `All (${orders.length})` : f}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex flex-col items-center py-16 space-y-3">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-text-muted">Loading your orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20">
                <span className="material-icons-outlined text-4xl text-primary">receipt_long</span>
              </div>
              <p className="text-text-muted">
                {filter === 'ALL' ? 'You haven\'t placed any orders yet' : `No ${filter.toLowerCase()} orders`}
              </p>
              {filter === 'ALL' && (
                <button onClick={() => navigate('/shop')} className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95">
                  Start Shopping
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(order => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-surface-dark rounded-2xl border border-primary/10 p-4 sm:p-5 hover:border-primary/25 transition-all cursor-pointer group card-lift"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-display font-bold text-text-main-light group-hover:text-primary transition-colors text-sm sm:text-base">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[order.status] || ''}`}>
                          <span className="material-icons-outlined text-xs">{statusIcons[order.status]}</span>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <span className="material-icons-outlined text-xs">calendar_today</span>
                          {formatDate(order.createdAt)}
                        </span>
                        <span>·</span>
                        <span>{order.totalItems} item{order.totalItems !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span className={paymentColors[order.paymentStatus] || ''}>
                          {order.paymentStatus === 'COMPLETED' ? '💳 Paid' : order.paymentStatus === 'FAILED' ? '❌ Failed' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Price + Arrow */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-lg sm:text-xl font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                      <span className="material-icons-outlined text-text-muted group-hover:text-primary transition-colors">chevron_right</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default MyOrders
