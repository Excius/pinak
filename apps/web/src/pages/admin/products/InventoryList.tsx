import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getOutOfStockProductsAdmin,
  getLowStockProductsAdmin,
  type AdminProduct
} from '../../../api/admin/admin.products.api'

type Tab = 'low' | 'out'

const InventoryList: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('low')

  useEffect(() => {
    fetchInventory()
  }, [activeTab])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const data = activeTab === 'out' 
        ? await getOutOfStockProductsAdmin() 
        : await getLowStockProductsAdmin()
      setProducts(data.items || data || [])
    } catch (error) {
      console.error('Failed to load inventory', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const getProductImage = (product: AdminProduct) => {
    return product.variants?.[0]?.images?.find(i => i.isPrimary)?.url ||
           product.variants?.[0]?.images?.[0]?.url
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">Inventory Alerts</h1>
          <p className="text-sm text-text-muted mt-1">Manage low stock and out-of-stock products.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-primary/10">
        <button
          onClick={() => setActiveTab('low')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'low' 
              ? 'text-primary border-primary' 
              : 'text-text-muted border-transparent hover:text-text-main-light'
          }`}
        >
          Low Stock
        </button>
        <button
          onClick={() => setActiveTab('out')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'out' 
              ? 'text-red-400 border-red-500' 
              : 'text-text-muted border-transparent hover:text-text-main-light'
          }`}
        >
          Out of Stock
        </button>
      </div>

      {/* Table */}
      <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10 bg-background-main/50">
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Product</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">SKU</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Current Stock</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-text-muted text-sm">
                  Loading inventory...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-text-muted text-sm">
                  <span className="material-icons-outlined text-4xl mb-3 block text-primary/30">check_circle</span>
                  No {activeTab === 'low' ? 'low stock' : 'out of stock'} products found.
                </td>
              </tr>
            ) : (
              products.map(product => {
                const img = getProductImage(product)
                // Depending on the backend query, the product might have one variant filtered or all variants
                const variant = product.variants?.[0]
                return (
                  <tr key={product.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-surface-dark border border-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {img ? (
                            <img src={img} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-icons-outlined text-text-muted">image</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-text-main-light">{product.name}</p>
                          <p className="text-xs text-text-muted mt-0.5 truncate max-w-[200px]">{product.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-background-main px-2 py-1 rounded text-text-muted">
                        {variant?.sku || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold ${
                        activeTab === 'out' 
                          ? 'bg-red-500/10 text-red-400' 
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {variant?.stock ?? 0} {variant?.lowStockThreshold ? `/ ${variant.lowStockThreshold} min` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        <span className="material-icons-outlined text-[18px]">edit</span>
                        Manage
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventoryList
