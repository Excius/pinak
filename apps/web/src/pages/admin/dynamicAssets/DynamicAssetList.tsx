import React, { useState, useEffect, useRef } from 'react'
import {
  getAllDynamicAssetsAdmin,
  createDynamicAssetAdmin,
  updateDynamicAssetAdmin,
  replaceDynamicAssetFileAdmin,
  hardDeleteDynamicAssetAdmin,
  type AdminDynamicAsset
} from '../../../api/admin/admin.dynamicAsset.api'

const DynamicAssetList: React.FC = () => {
  const [assets, setAssets] = useState<AdminDynamicAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AdminDynamicAsset | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [form, setForm] = useState({
    slug: '',
    title: '',
    description: '',
    type: 'IMAGE' as 'IMAGE' | 'VIDEO',
    isActive: true
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const data = await getAllDynamicAssetsAdmin()
      setAssets(data.items || [])
    } catch (error) {
      console.error('Failed to load assets', error)
      if (assets.length === 0) {
        setAssets([])
      }
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({
      slug: '',
      title: '',
      description: '',
      type: 'IMAGE',
      isActive: true
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    setShowModal(true)
  }

  const openEdit = (asset: AdminDynamicAsset) => {
    setEditing(asset)
    setForm({
      slug: asset.slug,
      title: asset.title || '',
      description: asset.description || '',
      type: asset.type === 'LOTTIE' ? 'IMAGE' : asset.type,
      isActive: asset.isActive
    })
    setSelectedFile(null)
    setPreviewUrl(asset.url)
    setShowModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        // Update metadata
        await updateDynamicAssetAdmin(editing.id, {
          slug: form.slug,
          title: form.title,
          description: form.description,
          isActive: form.isActive
        })

        // Replace file if selected
        if (selectedFile) {
          const formData = new FormData()
          formData.append('file', selectedFile)
          await replaceDynamicAssetFileAdmin(editing.id, formData)
        }
      } else {
        // Create new
        const formData = new FormData()
        formData.append('slug', form.slug)
        formData.append('title', form.title)
        formData.append('description', form.description)
        formData.append('type', form.type)
        formData.append('isActive', String(form.isActive))
        if (selectedFile) {
          formData.append('file', selectedFile)
        }
        await createDynamicAssetAdmin(formData)
      }
      setShowModal(false)
      fetchAssets()
    } catch (error) {
      console.error('Failed to save asset', error)
      alert('Failed to save asset.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await hardDeleteDynamicAssetAdmin(id)
      fetchAssets()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete', error)
      alert('Failed to delete asset.')
      setDeleteConfirm(null)
    }
  }

  if (loading && assets.length === 0) return <div className="p-8 text-center text-text-muted">Loading assets...</div>

  return (
    <div className="space-y-6">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-display font-bold text-text-main-light mb-6">
              {editing ? 'Edit Asset' : 'New Dynamic Asset'}
            </h2>
            <div className="space-y-4">
              
              {/* File Upload Area */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Asset File</label>
                <div 
                  className="border-2 border-dashed border-primary/20 rounded-xl p-4 text-center cursor-pointer hover:bg-primary/5 transition-colors relative overflow-hidden group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept={form.type === 'IMAGE' ? 'image/*' : 'video/*'}
                  />
                  {previewUrl ? (
                    <div className="relative h-40 w-full rounded-lg overflow-hidden bg-background-main flex items-center justify-center">
                      {form.type === 'IMAGE' ? (
                         <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                      ) : (
                         <video src={previewUrl} className="max-w-full max-h-full" controls />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-sm font-bold">Change File</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <span className="material-icons-outlined text-4xl text-primary/50 mb-2">cloud_upload</span>
                      <p className="text-sm text-text-muted">Click to upload {form.type.toLowerCase()} file</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Slug (Unique ID)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary font-mono text-sm"
                  placeholder="e.g. home-hero-banner"
                  disabled={!!editing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as 'IMAGE' | 'VIDEO' })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                    disabled={!!editing}
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Title (Optional)</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                    placeholder="Summer Sale Hero"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description (Admin Notes)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary resize-none h-20"
                  placeholder="Notes about this asset..."
                />
              </div>

              <div className="flex items-center justify-between mt-2">
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
                  disabled={saving || !form.slug.trim() || (!editing && !selectedFile)}
                  className="flex-1 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update' : 'Upload'}
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
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">Delete Asset?</h3>
            <p className="text-sm text-text-muted mb-6">This will permanently delete the asset file. Any frontend components relying on this slug will fail to load it.</p>
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
          <h1 className="text-2xl font-display font-bold text-text-main-light">Dynamic Assets</h1>
          <p className="text-sm text-text-muted mt-1">Manage banners, videos, and promotional graphics.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">cloud_upload</span>
          Upload Asset
        </button>
      </div>

      {/* Table */}
      <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10 bg-background-main/50">
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Preview</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Slug / ID</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Title</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted text-sm">
                  No assets uploaded. Click "Upload Asset" to create one.
                </td>
              </tr>
            )}
            {assets.map(asset => (
              <tr key={asset.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors">
                <td className="px-6 py-4 w-32">
                  <div className="w-24 h-16 rounded-lg bg-background-main border border-primary/10 flex items-center justify-center overflow-hidden">
                    {asset.type === 'IMAGE' ? (
                      <img src={asset.url} alt={asset.slug} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="material-icons-outlined text-text-muted">videocam</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-primary bg-primary/5 px-2 py-1 rounded">
                    {asset.slug}
                  </span>
                  <p className="text-[10px] text-text-muted mt-1 uppercase">{asset.type}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-text-main-light">{asset.title || '—'}</p>
                  {asset.description && <p className="text-xs text-text-muted mt-0.5 truncate max-w-xs">{asset.description}</p>}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    asset.isActive
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${asset.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                    {asset.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(asset)}
                      className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                    >
                      <span className="material-icons-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(asset.id)}
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

export default DynamicAssetList
