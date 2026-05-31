import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllComboKitsAdmin,
  softDeleteComboKitAdmin,
  restoreComboKitAdmin
} from '../../../api/admin/admin.combos.api'
import type { AdminComboKit } from '../../../api/admin/admin.combos.api'

const ComboKitList = () => {
  const [combos, setCombos] = useState<AdminComboKit[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchCombos = async () => {
    try {
      const { items } = await getAllComboKitsAdmin()
      setCombos(items)
    } catch (err) {
      console.error('Failed to fetch combo kits', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCombos() }, [])



  const handleDelete = async (id: string) => {
    try {
      await softDeleteComboKitAdmin(id)
      setDeleteConfirm(null)
      await fetchCombos()
    } catch (err) {
      console.error('Failed to delete combo kit', err)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreComboKitAdmin(id)
      await fetchCombos()
    } catch (err) {
      console.error('Failed to restore combo kit', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-text-muted">Loading combo kits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-background-light border border-red-500/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <span className="material-icons-outlined text-4xl text-red-500 mb-4">warning</span>
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">Delete Combo Kit?</h3>
            <p className="text-sm text-text-muted mb-6">This will soft-delete the combo kit. It can be restored later.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">Combo Kits</h1>
          <p className="text-sm text-text-muted mt-1">Manage curated product bundles and offers.</p>
        </div>
        <Link
          to="/admin/combos/new"
          className="bg-primary text-black px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Combo Kit
        </Link>
      </div>

      {/* Table */}
      {combos.length === 0 ? (
        <div className="bg-background-light rounded-2xl border border-primary/10 p-12 text-center">
          <span className="material-icons-outlined text-4xl text-primary/20 mb-3 block">auto_awesome_mosaic</span>
          <p className="text-sm text-text-muted">No combo kits yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-primary/10 text-xs text-text-muted uppercase tracking-widest">
                <th className="px-6 py-4 font-bold">Combo Kit</th>
                <th className="px-6 py-4 font-bold">Items</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Strategy</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {combos.map(combo => (
                <tr key={combo.id} className="border-b border-primary/5 hover:bg-background-light/30 transition-colors">
                  {/* Name + Image */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-background-main border border-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {combo.imageUrl ? (
                          <img src={combo.imageUrl} alt={combo.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-icons-outlined text-text-muted">auto_awesome_mosaic</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-main-light truncate">{combo.name}</p>
                        <p className="text-xs text-text-muted font-mono mt-0.5">{combo.slug}</p>
                      </div>
                    </div>
                  </td>



                  {/* Items Count */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-main-light font-medium">{combo.items?.length || 0}</span>
                    <span className="text-xs text-text-muted ml-1">items</span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-sm font-medium text-text-main-light">
                    ₹{combo.price?.toLocaleString('en-IN') || '0'}
                  </td>

                  {/* Strategy */}
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                      {combo.pricingStrategy?.replace('_', ' ') || 'FIXED'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/combos/${combo.id}`}
                        className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                        title="Edit"
                      >
                        <span className="material-icons-outlined text-lg">edit</span>
                      </Link>
                      {combo.isDeleted ? (
                        <button
                          onClick={() => handleRestore(combo.id)}
                          className="p-2 text-text-muted hover:text-green-500 transition-colors rounded-lg hover:bg-green-500/5 cursor-pointer"
                          title="Restore"
                        >
                          <span className="material-icons-outlined text-lg">restore</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(combo.id)}
                          className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5 cursor-pointer"
                          title="Delete"
                        >
                          <span className="material-icons-outlined text-lg">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ComboKitList
