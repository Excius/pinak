import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getProductByIdAdmin,
  createProductAdmin,
  updateProductAdmin,
  updateProductVariantAdmin,
  addProductImageAdmin,
  setProductCategoriesAdmin
} from '../../../api/admin/admin.products.api'
import type { AdminProduct, AdminProductVariant } from '../../../api/admin/admin.products.api'
import { getAllCategoriesAdmin, getAllBrandsAdmin } from '../../../api/admin/admin.catalog.api'
import type { AdminCategory, AdminBrand } from '../../../api/admin/admin.catalog.api'

const ProductForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [brands, setBrands] = useState<AdminBrand[]>([])
  const [editingVariant, setEditingVariant] = useState<AdminProductVariant | null>(null)
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState<Partial<AdminProduct>>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    tags: [],
    brandId: '',
    metaTitle: '',
    metaDescription: '',
    keyIngredients: '',
    categories: [],
    variants: []
  })

  // ── Data Fetching ──────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brs] = await Promise.all([getAllCategoriesAdmin(), getAllBrandsAdmin()])
        setCategories(cats)
        setBrands(brs)

        if (isEdit && id) {
          const product = await getProductByIdAdmin(id)
          setFormData(product)
        }
      } catch (err) {
        console.error('Failed to fetch data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, isEdit])

  // ── Handlers ───────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    setSaveMessage(null)
    try {
      // Extract only the fields the backend CreateProduct / UpdateProduct schemas accept
      const allowedFields = [
        'name', 'slug', 'description', 'keyIngredients',
        'metaTitle', 'metaDescription', 'metaKeywords', 'seoKeyword',
        'model', 'ean', 'frontImageUrl',
        'tags', 'brandId', 'requiresShipping', 'outOfStockStatus',
        'dimensionLength', 'dimensionWidth', 'dimensionHeight', 'lengthClassId',
        'weightGrams', 'weightClassId', 'taxClassId',
        'sortOrder', 'isActive'
      ]

      const cleanData: Record<string, unknown> = {}
      for (const key of allowedFields) {
        const val = (formData as Record<string, unknown>)[key]
        // Skip empty strings, null, undefined — backend validates strictly
        if (val !== '' && val !== null && val !== undefined) {
          cleanData[key] = val
        }
      }

      // Categories are handled via a separate junction endpoint
      // The API response may have categories as { id, name } or { categoryId, category: { id, name } }
      const categoryIds = (formData.categories || [])
        .map((c: any) => c.id || c.categoryId)
        .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)

      if (isEdit && id) {
        await updateProductAdmin(id, cleanData)
        // Save categories separately — don't let it block the product save
        if (categoryIds.length > 0) {
          try {
            await setProductCategoriesAdmin(id, categoryIds)
          } catch (catErr) {
            console.warn('Category assignment failed (non-blocking):', catErr)
          }
        }
        setSaveMessage({ type: 'success', text: 'Product updated successfully!' })
      } else {
        // name is required for creation
        if (!cleanData.name) {
          setSaveMessage({ type: 'error', text: 'Product name is required.' })
          setSaving(false)
          return
        }
        const newProd = await createProductAdmin(cleanData)
        if (categoryIds.length > 0) {
          try {
            await setProductCategoriesAdmin(newProd.id, categoryIds)
          } catch (catErr) {
            console.warn('Category assignment failed (non-blocking):', catErr)
          }
        }
        navigate(`/admin/products/${newProd.id}`, { replace: true })
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save product'
      console.error('Save failed', err)
      setSaveMessage({ type: 'error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateVariant = async (variant: AdminProductVariant) => {
    try {
      const updated = await updateProductVariantAdmin(variant.id, {
        price: variant.price,
        stock: variant.stock,
        sku: variant.sku
      })
      // Merge updated fields back into local state
      setFormData(prev => ({
        ...prev,
        variants: prev.variants?.map(v => v.id === variant.id ? { ...v, ...updated } : v)
      }))
      setEditingVariant(null)
    } catch (err) {
      console.error('Failed to update variant', err)
    }
  }

  const handleImageUpload = async (variantId: string, file: File) => {
    const data = new FormData()
    data.append('image', file)
    data.append('isPrimary', 'false')
    data.append('displayOrder', '0')
    try {
      await addProductImageAdmin(variantId, data)
      // Refresh product data to see new image
      if (id) {
        const product = await getProductByIdAdmin(id)
        setFormData(product)
        // Also refresh the editing variant if it's the same one
        if (editingVariant?.id === variantId) {
          const refreshedVariant = product.variants?.find(v => v.id === variantId)
          if (refreshedVariant) setEditingVariant(refreshedVariant)
        }
      }
    } catch (err) {
      console.error('Image upload failed', err)
    }
  }

  const toggleCategory = (cat: AdminCategory) => {
    const exists = formData.categories?.some(c => c.id === cat.id)
    setFormData(prev => ({
      ...prev,
      categories: exists
        ? prev.categories?.filter(c => c.id !== cat.id)
        : [...(prev.categories || []), { id: cat.id, name: cat.name, slug: cat.slug }]
    }))
  }

  // ── Loading State ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-text-muted">Loading product data...</p>
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* ── Variant Edit Modal ──────────────────────────────────────── */}
      {editingVariant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingVariant(null)} />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-display font-bold text-text-main-light mb-6">
              Edit Variant: {editingVariant.sku}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">SKU</label>
                <input
                  type="text"
                  value={editingVariant.sku}
                  onChange={e => setEditingVariant({ ...editingVariant, sku: e.target.value })}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Price ($)</label>
                  <input
                    type="number"
                    value={editingVariant.price}
                    onChange={e => setEditingVariant({ ...editingVariant, price: Number(e.target.value) })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Stock</label>
                  <input
                    type="number"
                    value={editingVariant.stock}
                    onChange={e => setEditingVariant({ ...editingVariant, stock: Number(e.target.value) })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Variant Images</label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-background-main border border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary transition-all">
                  <span className="material-icons-outlined text-primary">cloud_upload</span>
                  <span className="text-sm text-text-muted">Upload Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(editingVariant.id, file)
                    }}
                  />
                </label>
                {editingVariant.images?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {editingVariant.images.map(img => (
                      <div key={img.id} className="w-14 h-14 rounded-lg border border-primary/10 overflow-hidden shrink-0">
                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingVariant(null)}
                  className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateVariant(editingVariant)}
                  className="flex-1 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/30 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Save Feedback Banner ────────────────────────────────────── */}
      {saveMessage && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2 ${
          saveMessage.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <span className="material-icons-outlined text-lg">
            {saveMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {saveMessage.text}
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">
            {isEdit ? `Edit: ${formData.name}` : 'Create New Product'}
          </h1>
          <p className="text-sm text-text-muted mt-1">Configure your product specifications and variants.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      {/* ── Form Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column — Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* General Info */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-4">General Information</h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Product Name</label>
              <input
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="e.g. Hydrating Face Cream"
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Slug</label>
                <input
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleChange}
                  placeholder="hydrating-face-cream"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all"
                />
              </div>

              {/* Custom Brand Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Brand</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light text-left flex justify-between items-center focus:border-primary/50 outline-none transition-all"
                  >
                    <span className={formData.brandId ? 'text-text-main-light' : 'text-text-muted'}>
                      {brands.find(b => b.id === formData.brandId)?.name || 'Select Brand'}
                    </span>
                    <span className={`material-icons-outlined text-text-muted transition-transform ${showBrandDropdown ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {showBrandDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowBrandDropdown(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0a0a0a] border border-primary/20 rounded-xl shadow-2xl py-2 max-h-60 overflow-y-auto">
                        <div
                          className="px-4 py-2.5 hover:bg-primary/10 text-text-muted cursor-pointer text-sm"
                          onClick={() => { setFormData(prev => ({ ...prev, brandId: '' })); setShowBrandDropdown(false) }}
                        >
                          None
                        </div>
                        {brands.map(b => (
                          <div
                            key={b.id}
                            className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                              formData.brandId === b.id
                                ? 'text-primary font-bold bg-primary/5'
                                : 'text-text-main-light hover:bg-primary/10'
                            }`}
                            onClick={() => { setFormData(prev => ({ ...prev, brandId: b.id })); setShowBrandDropdown(false) }}
                          >
                            {b.name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={5}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all resize-y"
              />
            </div>
          </section>

          {/* Variants (edit mode only) */}
          {isEdit && formData.variants && formData.variants.length > 0 && (
            <section className="bg-background-light rounded-2xl border border-primary/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase">Product Variants</h2>
                <span className="text-xs text-text-muted">{formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3">
                {formData.variants.map(v => (
                  <div
                    key={v.id}
                    className="p-4 bg-background-main rounded-xl border border-primary/5 flex items-center justify-between group hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-background-light flex items-center justify-center border border-primary/10 overflow-hidden">
                        {v.images?.[0]?.url
                          ? <img src={v.images[0].url} className="w-full h-full object-cover" alt="" />
                          : <span className="material-icons-outlined text-text-muted text-sm">image</span>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main-light">{v.sku}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">
                          {v.optionValues?.length > 0
                            ? v.optionValues.map(ov => `${ov.optionName}: ${ov.valueName}`).join(' / ')
                            : 'Standard Variant'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">${(v.price ?? 0).toFixed(0)}</p>
                        <p className="text-[10px] text-text-muted">
                          Stock: <span className={v.stock < 10 ? 'text-red-400' : 'text-green-400'}>{v.stock}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingVariant(v)}
                        className="p-2 text-text-muted hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-primary/5"
                      >
                        <span className="material-icons-outlined text-xl">settings</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column — Sidebar */}
        <div className="space-y-6">

          {/* Publishing */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">Publishing</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-main-light">Status</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none ${formData.isActive ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-[10px] text-text-muted italic">
              {formData.isActive ? 'Product is live on the storefront.' : 'Product is hidden (draft).'}
            </p>
          </section>

          {/* Organization — Categories */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">Categories</h2>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-text-main-light cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.categories?.some(c => c.id === cat.id) || false}
                    onChange={() => toggleCategory(cat)}
                    className="rounded border-primary/20 bg-background-main text-primary accent-amber-500"
                  />
                  {cat.name}
                </label>
              ))}
              {categories.length === 0 && <p className="text-xs text-text-muted italic">No categories found.</p>}
            </div>
          </section>

          {/* SEO */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">SEO Details</h2>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Meta Title</label>
              <input
                name="metaTitle"
                value={formData.metaTitle || ''}
                onChange={handleChange}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-3 py-2 text-sm text-text-main-light outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Meta Description</label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription || ''}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-3 py-2 text-sm text-text-main-light outline-none resize-y"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProductForm
