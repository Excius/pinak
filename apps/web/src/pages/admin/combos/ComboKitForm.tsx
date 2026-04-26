import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getComboKitByIdAdmin,
  createComboKitAdmin,
  updateComboKitAdmin
} from '../../../api/admin/admin.combos.api'
import type { AdminComboKit } from '../../../api/admin/admin.combos.api'

const pricingStrategies = ['FIXED_PRICE', 'CALCULATED', 'DYNAMIC'] as const
const discountTypes = ['PERCENTAGE', 'FIXED_AMOUNT'] as const

const ComboKitForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState<Partial<AdminComboKit>>({
    name: '',
    slug: '',
    description: '',
    audience: '',
    price: 0,
    pricingStrategy: 'FIXED_PRICE',
    discountType: null,
    discountValue: null,
    tags: [],
    imageUrl: '',
    isActive: true,
    sortOrder: 0
  })

  useEffect(() => {
    if (isEdit && id) {
      getComboKitByIdAdmin(id)
        .then(data => setForm(data))
        .catch(err => console.error('Failed to load combo kit', err))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      const allowedFields = [
        'name', 'slug', 'description', 'audience',
        'price', 'pricingStrategy', 'discountType', 'discountValue',
        'tags', 'imageUrl', 'isActive', 'sortOrder',
        'metaTitle', 'metaDescription', 'metaKeywords', 'seoKeyword'
      ]
      const payload: Record<string, unknown> = {}
      for (const key of allowedFields) {
        const val = (form as Record<string, unknown>)[key]
        if (val !== '' && val !== null && val !== undefined) {
          payload[key] = val
        }
      }
      // Ensure price is a number
      if (payload.price !== undefined) payload.price = Number(payload.price)
      if (payload.sortOrder !== undefined) payload.sortOrder = Number(payload.sortOrder)
      if (payload.discountValue !== undefined) payload.discountValue = Number(payload.discountValue)

      if (isEdit && id) {
        await updateComboKitAdmin(id, payload)
        setSaveMsg({ type: 'success', text: 'Combo kit updated!' })
      } else {
        if (!payload.name) {
          setSaveMsg({ type: 'error', text: 'Name is required.' })
          setSaving(false)
          return
        }
        if (payload.price === undefined || payload.price === 0) {
          payload.price = 0
        }
        const created = await createComboKitAdmin(payload)
        navigate(`/admin/combos/${created.id}`, { replace: true })
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Save failed'
      setSaveMsg({ type: 'error', text: msg })
      console.error('Combo save failed', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-text-muted">Loading combo kit...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* Save Message */}
      {saveMsg && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2 ${
          saveMsg.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <span className="material-icons-outlined text-lg">
            {saveMsg.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {saveMsg.text}
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
          <button
            onClick={() => navigate('/admin/combos')}
            className="px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Combo Kit'}
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Main */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-4">General Information</h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Name *</label>
              <input
                name="name" value={form.name || ''} onChange={handleChange}
                placeholder="e.g. Summer Glow Kit"
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Slug</label>
                <input
                  name="slug" value={form.slug || ''} onChange={handleChange}
                  placeholder="summer-glow-kit"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Audience</label>
                <input
                  name="audience" value={form.audience || ''} onChange={handleChange}
                  placeholder="e.g. Oily Skin, Dry Skin"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Description</label>
              <textarea
                name="description" value={form.description || ''} onChange={handleChange} rows={4}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all resize-y"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Image URL</label>
              <input
                name="imageUrl" value={form.imageUrl || ''} onChange={handleChange}
                placeholder="https://example.com/combo-image.jpg"
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all"
              />
            </div>
          </section>

          {/* Items Preview (edit mode) */}
          {isEdit && form.items && form.items.length > 0 && (
            <section className="bg-background-light rounded-2xl border border-primary/10 p-6">
              <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-4">
                Bundle Items ({form.items.length})
              </h2>
              <div className="space-y-3">
                {form.items.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 bg-background-main rounded-xl border border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-background-light border border-primary/10 flex items-center justify-center overflow-hidden">
                        {item.productVariant?.imageUrl
                          ? <img src={item.productVariant.imageUrl} className="w-full h-full object-cover" alt="" />
                          : <span className="material-icons-outlined text-text-muted text-sm">inventory_2</span>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main-light">{item.productVariant?.sku || 'Unknown Variant'}</p>
                        <p className="text-[10px] text-text-muted">Qty: {item.quantity} · {item.isRequired ? 'Required' : 'Optional'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.originalPrice && <p className="text-xs text-text-muted line-through">₹{item.originalPrice}</p>}
                      {item.discountedPrice && <p className="text-sm font-bold text-primary">₹{item.discountedPrice}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">Pricing</h2>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Price (₹) *</label>
              <input
                name="price" type="number" value={form.price ?? 0}
                onChange={e => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Strategy</label>
              <select
                name="pricingStrategy" value={form.pricingStrategy || 'FIXED_PRICE'}
                onChange={handleChange}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary appearance-none"
              >
                {pricingStrategies.map(s => (
                  <option key={s} value={s} className="bg-[#0a0a0a]">{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Discount Type</label>
                <select
                  value={form.discountType || ''}
                  onChange={e => setForm(prev => ({ ...prev, discountType: (e.target.value || null) as any }))}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-3 py-3 text-sm text-text-main-light outline-none appearance-none"
                >
                  <option value="" className="bg-[#0a0a0a]">None</option>
                  {discountTypes.map(d => (
                    <option key={d} value={d} className="bg-[#0a0a0a]">{d.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Discount Value</label>
                <input
                  type="number" value={form.discountValue ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, discountValue: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-3 py-3 text-sm text-text-main-light outline-none"
                />
              </div>
            </div>
          </section>

          {/* Publishing */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">Publishing</h2>
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Sort Order</label>
              <input
                type="number" value={form.sortOrder ?? 0}
                onChange={e => setForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-3 py-2 text-sm text-text-main-light outline-none"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ComboKitForm
