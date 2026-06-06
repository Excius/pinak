import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderById } from '../api/cart.api'
import type { Order } from '../api/cart.api'

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return
      try {
        const data = await getOrderById(orderId)
        setOrder(data)
      } catch (err: any) {
        console.error('Failed to fetch order', err)
        setError('Order not found or access denied')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-text-muted">Fetching your order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <span className="material-icons-outlined text-red-500 text-4xl">error_outline</span>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-main-light">Something went wrong</h1>
            <p className="text-text-muted mt-2">{error || "We couldn't find that order."}</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="w-full bg-primary text-black py-3 rounded-xl font-bold hover:bg-primary-hover transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  return (
    <div className="min-h-screen bg-background-light py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
            <span className="material-icons-outlined text-primary text-4xl">check_circle</span>
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-text-main-light">Order Placed Successfully!</h1>
            <p className="text-text-muted mt-2">
              Thank you for your purchase. Your order <span className="text-primary font-mono font-bold">#{order.id}</span> is being processed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface-dark border border-primary/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-primary/10 flex justify-between items-center">
                <h2 className="font-bold text-text-main-light">Order Items</h2>
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {order.status}
                </span>
              </div>
              <div className="p-6 space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-main-light truncate">{item.productName}</p>
                      <p className="text-xs text-text-muted mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-primary font-mono ml-4">
                      {formatPrice(item.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-background-light/30 border-t border-primary/10 space-y-3">
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(order.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Shipping</span>
                  <span className="font-mono">{formatPrice(order.shippingAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Tax</span>
                  <span className="font-mono">{formatPrice(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-text-main-light pt-2 border-t border-primary/5">
                  <span>Total Paid</span>
                  <span className="text-primary font-mono">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-surface-dark border border-primary/10 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Payment Info</h3>
              <div className="flex items-center gap-3">
                <span className="material-icons-outlined text-primary">account_balance_wallet</span>
                <div>
                  <p className="text-sm font-bold text-text-main-light">Status: {order.paymentStatus}</p>
                  <p className="text-xs text-text-muted">Paid via Credit/Debit Card</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-dark border border-primary/10 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Estimated Delivery</h3>
              <div className="flex items-center gap-3">
                <span className="material-icons-outlined text-primary">local_shipping</span>
                <div>
                  <p className="text-sm font-bold text-text-main-light">3-5 Business Days</p>
                  <p className="text-xs text-text-muted">Standard Shipping</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/shop')}
              className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-icons-outlined text-lg">shopping_bag</span>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
