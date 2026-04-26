import { useState, useEffect } from 'react'
import {
  getAllBrandsAdmin,
  createBrandAdmin,
  updateBrandAdmin,
  deleteBrandAdmin
} from '../../../api/admin/admin.catalog.api'
import type { AdminBrand } from '../../../api/admin/admin.catalog.api'

interface BrandFormData {
  name: string
  slug: string
  logoUrl: string
  isActive: boolean
}

const emptyForm: BrandFormData = { name: '', slug: '', logoUrl: '', isActive: true }

const BrandList = () => {
  const [brands, setBrands] = useState<AdminBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<AdminBrand | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<BrandFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchBrands = async () => {
    try {
      const data = await getAllBrandsAdmin()
      setBrands(data)
    } catch (err) {
      console.error('Failed to fetch brands', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBrands() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (brand: AdminBrand) => {
    setEditing(brand)
    setForm({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl || '',
      isActive: brand.isActive
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { name: form.name, isActive: form.isActive }
      if (form.slug.trim()) payload.slug = form.slug
      if (form.logoUrl.trim()) payload.logoUrl = form.logoUrl

      if (editing) {
        await updateBrandAdmin(editing.id, payload as any)
      } else {
        await createBrandAdmin(payload as any)
      }
      setShowModal(false)
      setForm(emptyForm)
      setEditing(null)
      await fetchBrands()
    } catch (err) {
      console.error('Failed to save brand', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBrandAdmin(id)
      setDeleteConfirm(null)
      await fetchBrands()
    } catch (err) {
      console.error('Failed to delete brand', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-text-muted">Loading brands...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-display font-bold text-text-main-light mb-6">
              {editing ? 'Edit Brand' : 'New Brand'}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Brand Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. LipLux"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Slug</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="liplux (auto-generated if empty)"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Logo URL</label>
                <input
                  value={form.logoUrl}
                  onChange={e => setForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
                {form.logoUrl && (
                  <div className="w-16 h-16 rounded-lg border border-primary/10 overflow-hidden bg-background-main flex items-center justify-center mt-2">
                    <img src={form.logoUrl} className="max-w-full max-h-full object-contain" alt="Logo preview" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-main-light">Active</span>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none ${form.isActive ? 'bg-primary' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="flex-1 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-background-light border border-red-500/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <span className="material-icons-outlined text-4xl text-red-500 mb-4">warning</span>
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">Delete Brand?</h3>
            <p className="text-sm text-text-muted mb-6">This will permanently remove the brand and unlink it from all associated products.</p>
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
          <h1 className="text-2xl font-display font-bold text-text-main-light">Brands</h1>
          <p className="text-sm text-text-muted mt-1">Manage your product brands and logos.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Brand
        </button>
      </div>

      {/* Table */}
      <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10 bg-background-main/50">
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Brand</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Slug</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-text-muted text-sm">
                  No brands yet. Click "New Brand" to create one.
                </td>
              </tr>
            )}
            {brands.map(brand => (
              <tr key={brand.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg border border-primary/10 bg-background-main flex items-center justify-center overflow-hidden">
                      {brand.logoUrl
                        ? <img src={brand.logoUrl} className="max-w-full max-h-full object-contain" alt="" />
                        : <span className="material-icons-outlined text-text-muted text-sm">branding_watermark</span>
                      }
                    </div>
                    <p className="text-sm font-bold text-text-main-light">{brand.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-text-muted font-mono bg-background-main px-2 py-1 rounded">{brand.slug}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    brand.isActive
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${brand.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                    {brand.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(brand)}
                      className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                    >
                      <span className="material-icons-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(brand.id)}
                      className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5"
                    >
                      <span className="material-icons-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BrandList
