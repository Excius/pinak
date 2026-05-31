import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import {
  listOrdersAdmin,
  updateOrderStatusAdmin,
  updatePaymentStatusAdmin,
  hardDeleteOrderAdmin,
} from '../../../api/admin/admin.orders.api'
import type { AdminOrder, AdminOrderListParams, OrderStatus, PaymentStatus } from '../../../api/admin/admin.orders.api'

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED']

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

const statusDotColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500',
  PROCESSING: 'bg-blue-500',
  SHIPPED: 'bg-indigo-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
}

const paymentColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  COMPLETED: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-700',
}

const paymentDotColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-500',
  COMPLETED: 'bg-green-500',
  FAILED: 'bg-red-500',
}

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const AdminOrderList = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<AdminOrderListParams>({ page: 1, limit: 10 })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const result = await listOrdersAdmin(params)
      setOrders(result.items)
      setPagination(result.pagination)
    } catch (err) {
      console.error('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [params])

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      const updated = await updateOrderStatusAdmin(orderId, status)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o))
    } catch (err) {
      console.error('Failed to update status', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handlePaymentChange = async (orderId: string, paymentStatus: PaymentStatus) => {
    setUpdatingId(orderId)
    try {
      const updated = await updatePaymentStatusAdmin(orderId, paymentStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: updated.paymentStatus } : o))
    } catch (err) {
      console.error('Failed to update payment status', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleHardDelete = async (orderId: string) => {
    try {
      await hardDeleteOrderAdmin(orderId)
      setOrders(prev => prev.filter(o => o.id !== orderId))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
      setConfirmDelete(null)
    } catch (err) {
      console.error('Failed to delete order', err)
    }
  }

  const statusFilter = params.status || ''
  const paymentFilter = params.paymentStatus || ''

  // Stat cards
  const totalRevenue = orders.reduce((sum, o) => o.paymentStatus === 'COMPLETED' ? sum + o.totalAmount : sum, 0)
  const pendingCount = orders.filter(o => o.status === 'PENDING').length
  const shippedCount = orders.filter(o => o.status === 'SHIPPED').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-text-main-light">Orders Management</h1>
        <p className="text-sm text-text-muted mt-1">Track, manage, and fulfill customer orders.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: pagination.total, icon: 'receipt_long', color: 'text-primary' },
          { label: 'Revenue (Paid)', value: formatPrice(totalRevenue), icon: 'payments', color: 'text-green-600' },
          { label: 'Pending', value: pendingCount, icon: 'hourglass_empty', color: 'text-yellow-600' },
          { label: 'Shipped', value: shippedCount, icon: 'local_shipping', color: 'text-indigo-600' },
        ].map(card => (
          <div key={card.label} className="bg-background-light rounded-2xl border border-primary/10 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
              <span className={`material-icons-outlined text-xl ${card.color}`}>{card.icon}</span>
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{card.label}</p>
              <p className="text-lg font-bold text-text-main-light">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-background-light rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-primary/10 flex flex-wrap gap-3 items-center justify-between bg-background-main/50">
          <div className="flex flex-wrap gap-2">
            {/* Order status filter */}
            <select
              value={statusFilter}
              onChange={e => setParams({ ...params, status: e.target.value as OrderStatus || undefined, page: 1 })}
              className="px-3 py-2 bg-background-light border border-primary/20 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-text-main-light cursor-pointer"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {/* Payment status filter */}
            <select
              value={paymentFilter}
              onChange={e => setParams({ ...params, paymentStatus: e.target.value as PaymentStatus || undefined, page: 1 })}
              className="px-3 py-2 bg-background-light border border-primary/20 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-text-main-light cursor-pointer"
            >
              <option value="">All Payments</option>
              {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="text-sm text-text-muted">
            {pagination.total} order{pagination.total !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-light/50 border-b border-primary/10 text-xs tracking-widest text-primary/70 uppercase">
                <th className="px-6 py-4 font-bold">Order</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Payment</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                    <span className="material-icons-outlined text-4xl text-primary/20 block mb-2">inbox</span>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <>
                    <tr
                      key={order.id}
                      className={`border-b border-primary/5 hover:bg-background-light/30 transition-colors cursor-pointer ${expandedId === order.id ? 'bg-primary/[0.03]' : ''}`}
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                            <span className="material-icons-outlined text-primary text-lg">receipt</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-main-light font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-text-muted">{order.totalItems} item{order.totalItems !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-text-main-light">{order.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-text-muted truncate max-w-[160px]">{order.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${statusColors[order.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[order.status]}`} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${paymentColors[order.paymentStatus]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${paymentDotColors[order.paymentStatus]}`} />
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-text-main-light font-mono">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <span className="material-icons-outlined text-[20px]">
                              {expandedId === order.id ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setConfirmDelete(order.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete permanently"
                            >
                              <span className="material-icons-outlined text-[20px]">delete_forever</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-primary/[0.02]">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Order Items */}
                            <div className="lg:col-span-2 space-y-4">
                              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Order Items</h3>
                              <div className="space-y-2">
                                {order.items.map(item => (
                                  <div key={item.id} className="flex items-center justify-between bg-background-light/60 rounded-xl px-4 py-3 border border-primary/5">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-10 h-10 bg-background-light rounded-lg border border-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                                        {item.productVariant?.images?.[0]?.url ? (
                                          <img src={item.productVariant.images[0].url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <span className="material-icons-outlined text-text-muted/40 text-lg">
                                            {item.comboKitId ? 'auto_awesome_mosaic' : 'inventory_2'}
                                          </span>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-bold text-text-main-light truncate">{item.productName}</p>
                                        <p className="text-xs text-text-muted">
                                          Qty: {item.quantity} × {formatPrice(item.price)}
                                          {item.productVariant?.sku && <span className="ml-2 font-mono opacity-60">SKU: {item.productVariant.sku}</span>}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-bold text-primary font-mono whitespace-nowrap ml-4">{formatPrice(item.lineTotal)}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Price Breakdown */}
                              <div className="bg-background-light/60 rounded-xl px-4 py-3 border border-primary/5 space-y-1.5">
                                <div className="flex justify-between text-sm text-text-muted">
                                  <span>Subtotal</span><span className="font-mono">{formatPrice(order.subtotalAmount)}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                  <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span><span className="font-mono">-{formatPrice(order.discountAmount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-sm text-text-muted">
                                  <span>Tax</span><span className="font-mono">{formatPrice(order.taxAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-text-muted">
                                  <span>Shipping</span><span className="font-mono">{formatPrice(order.shippingAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-text-main-light pt-1.5 border-t border-primary/10">
                                  <span>Total</span><span className="font-mono text-primary">{formatPrice(order.totalAmount)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status Controls */}
                            <div className="space-y-4">
                              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Manage Order</h3>

                              {/* Update Order Status */}
                              <div className="bg-background-light/60 rounded-xl p-4 border border-primary/5 space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Order Status</label>
                                <select
                                  value={order.status}
                                  onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                  disabled={updatingId === order.id}
                                  className="w-full px-3 py-2.5 bg-background-light border border-primary/20 rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-text-main-light cursor-pointer disabled:opacity-50"
                                >
                                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>

                              {/* Update Payment Status */}
                              <div className="bg-background-light/60 rounded-xl p-4 border border-primary/5 space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Payment Status</label>
                                <select
                                  value={order.paymentStatus}
                                  onChange={e => handlePaymentChange(order.id, e.target.value as PaymentStatus)}
                                  disabled={updatingId === order.id}
                                  className="w-full px-3 py-2.5 bg-background-light border border-primary/20 rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-text-main-light cursor-pointer disabled:opacity-50"
                                >
                                  {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>

                              {/* Order Meta */}
                              <div className="bg-background-light/60 rounded-xl p-4 border border-primary/5 space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Details</label>
                                <div className="text-sm space-y-1.5 text-text-muted">
                                  <div className="flex justify-between">
                                    <span>Order ID</span>
                                    <span className="font-mono text-text-main-light text-xs">{order.id.slice(0, 16)}...</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Customer</span>
                                    <span className="text-text-main-light">{order.user?.name || '—'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Email</span>
                                    <span className="text-text-main-light text-xs truncate max-w-[140px]">{order.user?.email || '—'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Created</span>
                                    <span className="text-text-main-light text-xs">{formatDateTime(order.createdAt)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Updated</span>
                                    <span className="text-text-main-light text-xs">{formatDateTime(order.updatedAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-primary/10 flex items-center justify-between text-sm text-text-muted bg-background-light/50">
          <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
          <div className="flex gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setParams({ ...params, page: (params.page || 1) - 1 })}
              className="px-3 py-1 border border-primary/20 rounded-md hover:bg-primary/5 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setParams({ ...params, page: (params.page || 1) + 1 })}
              className="px-3 py-1 border border-primary/20 rounded-md hover:bg-primary/5 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-background-main border border-primary/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <span className="material-icons-outlined text-red-500 text-3xl">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main-light">Delete Order Permanently?</h3>
                <p className="text-sm text-text-muted mt-1">This action cannot be undone. The order and all its items will be permanently removed.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-2.5 border border-primary/20 rounded-xl text-sm font-bold text-text-muted hover:bg-background-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleHardDelete(confirmDelete)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrderList
