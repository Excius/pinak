import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllComboKitsAdmin,
  softDeleteComboKitAdmin,
  updateComboKitStatusAdmin
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

  const toggleStatus = async (combo: AdminComboKit) => {
    try {
      await updateComboKitStatusAdmin(combo.id, !combo.isActive)
      setCombos(prev => prev.map(c => c.id === combo.id ? { ...c, isActive: !c.isActive } : c))
    } catch (err) {
      console.error('Failed to toggle status', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await softDeleteComboKitAdmin(id)
      setDeleteConfirm(null)
      await fetchCombos()
    } catch (err) {
      console.error('Failed to delete combo kit', err)
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
                className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all hover:bg-red-700"
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
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Combo Kit
        </Link>
      </div>

      {/* Grid */}
      {combos.length === 0 ? (
        <div className="bg-background-light rounded-2xl border border-primary/10 p-12 text-center">
          <span className="material-icons-outlined text-4xl text-primary/20 mb-3">auto_awesome_mosaic</span>
          <p className="text-sm text-text-muted">No combo kits yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {combos.map(combo => (
            <div
              key={combo.id}
              className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden hover:border-primary/30 transition-all group"
            >
              {/* Image Header */}
              <div className="h-36 bg-background-main flex items-center justify-center relative overflow-hidden">
                {combo.imageUrl ? (
                  <img src={combo.imageUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="material-icons-outlined text-5xl text-primary/10">auto_awesome_mosaic</span>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    combo.isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {combo.isActive ? 'Active' : 'Draft'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/20 text-primary border border-primary/30">
                    {combo.pricingStrategy.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="text-sm font-bold text-text-main-light mb-1 truncate">{combo.name}</h3>
                <p className="text-xs text-text-muted mb-3 line-clamp-2">{combo.description || 'No description'}</p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-bold text-primary">₹{combo.price}</p>
                    <p className="text-[10px] text-text-muted">{combo.items?.length || 0} items in bundle</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted">Views: {combo.viewCount}</p>
                    <p className="text-[10px] text-text-muted">Sales: {combo.purchasedCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(combo)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-bold border border-primary/10 text-text-muted hover:bg-primary/5 transition-all"
                  >
                    {combo.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link
                    to={`/admin/combos/${combo.id}`}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-center bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(combo.id)}
                    className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5"
                  >
                    <span className="material-icons-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ComboKitList
