import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getComboKitByIdAdmin, createComboKitAdmin, updateComboKitAdmin,
  addComboKitItemAdmin, removeComboKitItemAdmin, updateComboKitItemAdmin,
  addComboKitImageAdmin, getAllComboKitImagesAdmin, setPrimaryComboKitImageAdmin, deleteComboKitImageAdmin
} from '../../../api/admin/admin.combos.api'
import { getAllProductsAdmin } from '../../../api/admin/admin.products.api'
import type { AdminComboKit, ComboKitItem, AdminComboKitImage } from '../../../api/admin/admin.combos.api'
import type { AdminProduct } from '../../../api/admin/admin.products.api'
import { formatPaise } from '../../../utils/currency'

const STRATEGIES = ['FIXED_PRICE', 'CALCULATED', 'DYNAMIC'] as const
const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'] as const

const ComboKitForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerLoading, setPickerLoading] = useState(false)

  const [form, setForm] = useState<Partial<AdminComboKit>>({
    name: '', slug: '', description: '', audience: '',
    price: 0, pricingStrategy: 'FIXED_PRICE',
    discountType: null, discountValue: null,
    tags: [], imageUrl: '', isActive: true, sortOrder: 0, items: [],
    metaTitle: '', metaDescription: ''
  })

  const [images, setImages] = useState<AdminComboKitImage[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      getComboKitByIdAdmin(id)
        .then(data => setForm(data))
        .catch(err => console.error('Failed to load combo kit', err))
        .finally(() => setLoading(false))

      getAllComboKitImagesAdmin(id)
        .then(data => setImages(data))
        .catch(err => console.error('Failed to load combo kit images', err))
    }
  }, [id, isEdit])

  const set = (name: string, value: unknown) => setForm(p => ({ ...p, [name]: value }))

  const handleSave = async () => {
    setSaving(true); setMsg(null)
    try {
      const fields = ['name','slug','description','audience','price','pricingStrategy',
        'discountType','discountValue','tags','imageUrl','isActive','sortOrder','metaTitle','metaDescription']
      const payload: Record<string, unknown> = {}
      for (const k of fields) {
        const v = (form as any)[k]
        if (v !== '' && v !== null && v !== undefined) payload[k] = v
      }
      if (payload.price !== undefined) payload.price = Number(payload.price)
      if (payload.sortOrder !== undefined) payload.sortOrder = Number(payload.sortOrder)
      if (payload.discountValue !== undefined) payload.discountValue = Number(payload.discountValue)

      if (isEdit && id) {
        await updateComboKitAdmin(id, payload)
        setMsg({ type: 'success', text: 'Combo kit updated!' })
      } else {
        if (!payload.name) { setMsg({ type: 'error', text: 'Name is required.' }); setSaving(false); return }
        const created = await createComboKitAdmin(payload)
        navigate(`/admin/combos/${created.id}`, { replace: true })
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || err?.message || 'Save failed' })
    } finally { setSaving(false) }
  }

  // --- Item management ---
  const loadProducts = useCallback(async () => {
    setPickerLoading(true)
    try {
      const { items } = await getAllProductsAdmin({ limit: 100 })
      setProducts(items)
    } catch (e) { console.error(e) }
    finally { setPickerLoading(false) }
  }, [])

  const openPicker = () => { setShowPicker(true); loadProducts() }

  const addItem = async (variantId: string) => {
    if (!id) return
    try {
      const item = await addComboKitItemAdmin(id, { productVariantId: variantId, quantity: 1 })
      setForm(p => ({ ...p, items: [...(p.items || []), item] }))
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to add item' })
    }
  }

  const removeItem = async (itemId: string) => {
    if (!id) return
    try {
      await removeComboKitItemAdmin(id, itemId)
      setForm(p => ({ ...p, items: (p.items || []).filter(i => i.id !== itemId) }))
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to remove item' })
    }
  }

  const updateItemQty = async (item: ComboKitItem, qty: number) => {
    if (!id || qty < 1) return
    try {
      await updateComboKitItemAdmin(id, item.id, { quantity: qty })
      setForm(p => ({ ...p, items: (p.items || []).map(i => i.id === item.id ? { ...i, quantity: qty } : i) }))
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to update item' })
    }
  }

  // --- Image management (S3 Upload) ---
  const handleImageUpload = async (file: File) => {
    if (!id) return
    const data = new FormData()
    data.append('image', file)
    data.append('isPrimary', images.length === 0 ? 'true' : 'false')
    setUploadingImage(true)
    try {
      const newImg = await addComboKitImageAdmin(id, data)
      setImages(prev => [...prev, newImg])
      setMsg({ type: 'success', text: 'Image uploaded successfully to S3!' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to upload image' })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSetPrimaryImage = async (imgId: string) => {
    try {
      await setPrimaryComboKitImageAdmin(imgId)
      setImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === imgId })))
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to set primary image' })
    }
  }

  const handleDeleteImage = async (imgId: string) => {
    try {
      await deleteComboKitImageAdmin(imgId)
      setImages(prev => prev.filter(img => img.id !== imgId))
      setMsg({ type: 'success', text: 'Image removed' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to delete image' })
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    p.variants?.some(v => v.sku.toLowerCase().includes(pickerSearch.toLowerCase()))
  )

  const existingVariantIds = new Set((form.items || []).map(i => i.productVariantId))

  if (loading) return (
    <div className="flex justify-center items-center p-20">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-muted">Loading combo kit...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Toast */}
      {msg && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <span className="material-icons-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-auto material-icons-outlined text-lg cursor-pointer opacity-60 hover:opacity-100">close</button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">
            {isEdit ? `Edit: ${form.name}` : 'New Combo Kit'}
          </h1>
          <p className="text-sm text-text-muted mt-1">Configure your combo bundle details and pricing.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/combos')} className="px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-primary text-black px-8 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all disabled:opacity-50 cursor-pointer">
            {saving ? 'Saving...' : 'Save Combo Kit'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-4">General Information</h2>
            <Field label="Name *" name="name" value={form.name || ''} onChange={v => set('name', v)} placeholder="e.g. Summer Glow Kit" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug" name="slug" value={form.slug || ''} onChange={v => set('slug', v)} placeholder="summer-glow-kit" />
              <Field label="Audience" name="audience" value={form.audience || ''} onChange={v => set('audience', v)} placeholder="e.g. Oily Skin" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Description</label>
              <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all resize-y" />
            </div>
            {/* Combo Kit Images (S3 Direct Upload) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-muted uppercase">Combo Kit Images</label>
                {isEdit && (
                  <label className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                    <span className="material-icons-outlined text-sm">cloud_upload</span>
                    {uploadingImage ? 'Uploading to S3...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                        e.target.value = ''
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {!isEdit ? (
                <p className="text-xs text-text-muted bg-background-main/50 p-3 rounded-xl border border-primary/10">
                  Save combo kit first to upload and manage its images in S3.
                </p>
              ) : images.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-primary/20 rounded-xl bg-background-main/30">
                  <span className="material-icons-outlined text-2xl text-primary/30 mb-1 block">image</span>
                  <p className="text-xs text-text-muted">No images uploaded to S3 yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map(img => (
                    <div key={img.id} className={`group relative rounded-xl border overflow-hidden bg-background-main aspect-square flex items-center justify-center ${img.isPrimary ? 'border-primary ring-1 ring-primary' : 'border-primary/10'}`}>
                      <img src={img.url} alt={img.altText || form.name || 'Combo kit image'} className="w-full h-full object-cover" />
                      {img.isPrimary && (
                        <span className="absolute top-1.5 left-1.5 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                          Primary
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(img.id)}
                            title="Set as primary"
                            className="w-7 h-7 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-black flex items-center justify-center transition-all cursor-pointer"
                          >
                            <span className="material-icons-outlined text-sm">star</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          title="Delete image"
                          className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        >
                          <span className="material-icons-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Bundle Items (edit only) */}
          {isEdit && (
            <section className="bg-background-light rounded-2xl border border-primary/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase">
                  Bundle Items ({(form.items || []).length})
                </h2>
                <button onClick={openPicker} className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1.5 cursor-pointer">
                  <span className="material-icons-outlined text-sm">add</span>
                  Add Variant
                </button>
              </div>

              {(form.items || []).length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <span className="material-icons-outlined text-3xl text-primary/15 block mb-2">inventory_2</span>
                  <p className="text-sm">No items in this bundle yet. Click "Add Variant" to begin.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(form.items || []).map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-background-main rounded-xl border border-primary/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-background-light border border-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                          <span className="material-icons-outlined text-text-muted text-sm">inventory_2</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-main-light truncate">
                            {item.productVariant?.product?.name || item.productVariant?.sku || 'Unknown'}
                          </p>
                          <p className="text-[10px] text-text-muted font-mono">SKU: {item.productVariant?.sku || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateItemQty(item, item.quantity - 1)} disabled={item.quantity <= 1}
                            className="w-7 h-7 rounded-lg bg-background-light border border-primary/10 flex items-center justify-center text-text-muted hover:text-primary disabled:opacity-30 cursor-pointer">
                            <span className="material-icons-outlined text-sm">remove</span>
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-text-main-light">{item.quantity}</span>
                          <button onClick={() => updateItemQty(item, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-background-light border border-primary/10 flex items-center justify-center text-text-muted hover:text-primary cursor-pointer">
                            <span className="material-icons-outlined text-sm">add</span>
                          </button>
                        </div>
                        {item.productVariant?.price != null && (
                          <span className="text-xs text-text-muted">{formatPaise(item.productVariant.price * item.quantity)}</span>
                        )}
                        <button onClick={() => removeItem(item.id)} className="p-1.5 text-text-muted hover:text-red-500 transition-colors cursor-pointer" title="Remove">
                          <span className="material-icons-outlined text-lg">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SEO */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">SEO Details</h2>
            <Field label="Meta Title" name="metaTitle" value={form.metaTitle || ''} onChange={v => set('metaTitle', v)} placeholder="SEO title" />
            <Field label="Meta Description" name="metaDescription" value={form.metaDescription || ''} onChange={v => set('metaDescription', v)} placeholder="SEO description" />
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          {/* Pricing */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">Pricing</h2>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Price (₹) *</label>
              <input type="number" value={form.price ?? 0} onChange={e => set('price', Number(e.target.value))}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Strategy</label>
              <select value={form.pricingStrategy || 'FIXED_PRICE'} onChange={e => set('pricingStrategy', e.target.value)}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary appearance-none">
                {STRATEGIES.map(s => <option key={s} value={s} className="bg-[#0a0a0a]">{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Discount Type</label>
                <select value={form.discountType || ''} onChange={e => set('discountType', e.target.value || null)}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-3 py-3 text-sm text-text-main-light outline-none appearance-none">
                  <option value="" className="bg-[#0a0a0a]">None</option>
                  {DISCOUNT_TYPES.map(d => <option key={d} value={d} className="bg-[#0a0a0a]">{d.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Discount Value</label>
                <input type="number" value={form.discountValue ?? ''} onChange={e => set('discountValue', e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-3 py-3 text-sm text-text-main-light outline-none" />
              </div>
            </div>
          </section>

          {/* Publishing */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">Publishing</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-main-light">Active</span>
              <button type="button" onClick={() => set('isActive', !form.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none cursor-pointer ${form.isActive ? 'bg-primary' : 'bg-gray-600'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Sort Order</label>
              <input type="number" value={form.sortOrder ?? 0} onChange={e => set('sortOrder', Number(e.target.value))}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-3 py-2 text-sm text-text-main-light outline-none" />
            </div>
          </section>
        </div>
      </div>

      {/* Variant Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPicker(false)} />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl w-full max-w-xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-primary/10">
              <h3 className="text-lg font-display font-bold text-text-main-light mb-3">Add Variant to Bundle</h3>
              <input value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} placeholder="Search products or SKU..."
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {pickerLoading ? (
                <div className="text-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" /></div>
              ) : filteredProducts.length === 0 ? (
                <p className="text-center text-sm text-text-muted py-8">No products found.</p>
              ) : filteredProducts.map(product => (
                <div key={product.id} className="bg-background-main rounded-xl border border-primary/5 p-3">
                  <p className="text-sm font-bold text-text-main-light mb-2">{product.name}</p>
                  {(product.variants || []).map(v => {
                    const alreadyAdded = existingVariantIds.has(v.id)
                    return (
                      <div key={v.id} className="flex items-center justify-between py-1.5 pl-3 border-l-2 border-primary/10 ml-1 mb-1">
                        <div>
                          <span className="text-xs font-mono text-text-muted">{v.sku}</span>
                          <span className="text-xs text-text-muted ml-2">{formatPaise(v.price ?? 0)}</span>
                          <span className="text-xs text-text-muted ml-2">Stock: {v.stock}</span>
                        </div>
                        <button
                          disabled={alreadyAdded}
                          onClick={() => addItem(v.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${alreadyAdded ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'}`}
                        >
                          {alreadyAdded ? '✓ Added' : 'Add'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-primary/10">
              <button onClick={() => setShowPicker(false)} className="w-full py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all cursor-pointer">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable input field
const Field = ({ label, value, onChange, placeholder, name }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; name?: string }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-text-muted uppercase">{label}</label>
    <input name={name} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all" />
  </div>
)

export default ComboKitForm
