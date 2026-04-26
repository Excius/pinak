import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllProductsAdmin,
  updateProductStatusAdmin,
  softDeleteProductAdmin,
  restoreProductAdmin,
} from '../../../api/admin/admin.products.api'
import type { AdminProduct, AdminProductListParams } from '../../../api/admin/admin.products.api'

const AdminProductList = () => {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<AdminProductListParams>({ page: 1, limit: 10, search: '' })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { items, total } = await getAllProductsAdmin(params)
      setProducts(items)
      setTotal(total)
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [params])

  const handleStatusToggle = async (product: AdminProduct) => {
    try {
      const updated = await updateProductStatusAdmin(product.id, !product.isActive)
      setProducts(products.map(p => p.id === product.id ? { ...p, isActive: updated.isActive } : p))
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const handleDeleteToggle = async (product: AdminProduct) => {
    try {
      if (product.isDeleted) {
        await restoreProductAdmin(product.id)
        setProducts(products.map(p => p.id === product.id ? { ...p, isDeleted: false, deletedAt: null } : p))
      } else {
        await softDeleteProductAdmin(product.id)
        setProducts(products.map(p => p.id === product.id ? { ...p, isDeleted: true, deletedAt: new Date().toISOString(), isActive: false } : p))
      }
    } catch (err) {
      console.error('Failed to toggle delete status', err)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, search: e.target.value, page: 1 })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">Products Inventory</h1>
          <p className="text-sm text-text-muted mt-1">Manage your store catalog and inventory bounds.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Product
        </Link>
      </div>

      <div className="bg-background-light rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-primary/10 flex flex-wrap gap-4 items-center justify-between bg-background-main/50">
          <div className="relative w-full sm:w-80">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-background-light border border-primary/20 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text-main-light placeholder:text-text-muted/50"
              value={params.search || ''}
              onChange={handleSearch}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            Total {total} Products
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-light/50 border-b border-primary/10 text-xs tracking-widest text-primary/70 uppercase">
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Visibility</th>
                <th className="px-6 py-4 font-bold">Base Price</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    Loading inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className={`border-b border-primary/5 hover:bg-background-light/30 transition-colors ${product.isDeleted ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-background-light border border-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.frontImageUrl ? (
                            <img src={product.frontImageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-icons-outlined text-text-muted">image</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-main-light truncate">{product.name}</p>
                          <p className="text-xs text-text-muted font-mono mt-0.5">{product.sku || 'NO SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.isDeleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          Deleted
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${product.isActive ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-green-600' : 'bg-yellow-600'}`}></span>
                          {product.isActive ? 'Active' : 'Draft'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(product)}
                        disabled={product.isDeleted}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${product.isActive ? 'bg-primary' : 'bg-gray-200'
                          } ${product.isDeleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${product.isActive ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-main-light">
                      ${typeof product.basePrice === 'number' ? product.basePrice.toFixed(2) : '--'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/products/${product.id}`} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                          <span className="material-icons-outlined text-[20px]">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteToggle(product)}
                          className={`p-2 rounded-lg transition-colors ${product.isDeleted
                              ? 'text-green-500 hover:bg-green-50'
                              : 'text-red-500 hover:bg-red-50'
                            }`}
                          title={product.isDeleted ? 'Restore' : 'Delete'}
                        >
                          <span className="material-icons-outlined text-[20px]">
                            {product.isDeleted ? 'restore' : 'delete'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 border-t border-primary/10 flex items-center justify-between text-sm text-text-muted bg-background-light/50">
          <span>Showing {products.length} items</span>
          <div className="flex gap-1">
            <button
              disabled={params.page === 1}
              onClick={() => setParams({ ...params, page: (params.page || 1) - 1 })}
              className="px-3 py-1 border border-primary/20 rounded-md hover:bg-primary/5 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={products.length < (params.limit || 10)}
              onClick={() => setParams({ ...params, page: (params.page || 1) + 1 })}
              className="px-3 py-1 border border-primary/20 rounded-md hover:bg-primary/5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProductList
