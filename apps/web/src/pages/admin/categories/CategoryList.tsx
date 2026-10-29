import { useState, useEffect } from 'react'
import {
  getAllCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  addCategoryImageAdmin,
  deleteCategoryImageAdmin,
  setPrimaryCategoryImageAdmin
} from '../../../api/admin/admin.catalog.api'
import type { AdminCategory, AdminCategoryImage } from '../../../api/admin/admin.catalog.api'
import type { AdminCategory, AdminCategoryImage } from '../../../api/admin/admin.catalog.api'

interface CategoryFormData {
  name: string
  slug: string
  parentId: string
}

const emptyForm: CategoryFormData = { name: '', slug: '', parentId: '' }

const CategoryList = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CategoryFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageAltInput, setImageAltInput] = useState('')
  const [addingImage, setAddingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const data = await getAllCategoriesAdmin()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setImageUrlInput('')
    setImageAltInput('')
    setImageError(null)
    setShowModal(true)
  }

  const openEdit = async (cat: AdminCategory) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, parentId: cat.parentId || '' })
    setImageUrlInput('')
    setImageAltInput('')
    setImageError(null)
    setShowModal(true)
    try {
      const imgs = await getAllCategoryImagesAdmin(cat.id)
      setImages(imgs)
    } catch (err) {
      console.error('Failed to fetch category images', err)
      setImages([])
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    const data = new FormData()
    data.append('image', file)
    data.append('isPrimary', images.length === 0 ? 'true' : 'false')
    setUploadingImage(true)
    try {
      const newImg = await addCategoryImageAdmin(editing.id, data)
      setImages(prev => [...prev, newImg])
      await fetchCategories()
    } catch (err) {
      console.error('Failed to upload category image', err)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleSetPrimaryImage = async (imgId: string) => {
    try {
      await setPrimaryCategoryImageAdmin(imgId)
      setImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === imgId })))
      await fetchCategories()
    } catch (err) {
      console.error('Failed to set primary image', err)
    }
  }

  const handleDeleteImage = async (imgId: string) => {
    try {
      await deleteCategoryImageAdmin(imgId)
      setImages(prev => prev.filter(img => img.id !== imgId))
      await fetchCategories()
    } catch (err) {
      console.error('Failed to delete image', err)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { name: form.name }
      if (form.slug.trim()) payload.slug = form.slug
      if (form.parentId.trim()) payload.parentId = form.parentId

      if (editing) {
        await updateCategoryAdmin(editing.id, payload as any)
      } else {
        await createCategoryAdmin(payload as any)
      }
      setShowModal(false)
      setForm(emptyForm)
      setEditing(null)
      await fetchCategories()
    } catch (err) {
      console.error('Failed to save category', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategoryAdmin(id)
      setDeleteConfirm(null)
      await fetchCategories()
    } catch (err) {
      console.error('Failed to delete category', err)
    }
  }

  const handleAddImage = async (categoryId: string) => {
    const trimmedUrl = imageUrlInput.trim()
    if (!trimmedUrl) return
    try {
      new URL(trimmedUrl)
    } catch {
      setImageError('Please enter a valid URL (e.g. https://example.com/image.jpg)')
      return
    }

    setAddingImage(true)
    setImageError(null)
    try {
      const isFirst = !editing?.images || editing.images.length === 0
      await addCategoryImageAdmin(categoryId, {
        url: trimmedUrl,
        altText: imageAltInput.trim() || undefined,
        isPrimary: isFirst
      })
      setImageUrlInput('')
      setImageAltInput('')
      await fetchCategories()
      // Update editing state to show new images immediately
      if (editing?.id === categoryId) {
        const updatedCats = await getAllCategoriesAdmin()
        const updatedCat = updatedCats.find(c => c.id === categoryId)
        if (updatedCat) setEditing(updatedCat)
      }
    } catch (err: any) {
      console.error('Category image add failed', err)
      setImageError(err?.response?.data?.message || 'Failed to add image. Ensure the URL is valid.')
    } finally {
      setAddingImage(false)
    }
  }

  const handleDeleteImage = async (imageId: string, categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return
    try {
      await deleteCategoryImageAdmin(imageId)
      await fetchCategories()
      if (editing?.id === categoryId) {
        const updatedCats = await getAllCategoriesAdmin()
        const updatedCat = updatedCats.find(c => c.id === categoryId)
        if (updatedCat) setEditing(updatedCat)
      }
    } catch (err) {
      console.error('Category image delete failed', err)
    }
  }

  const handleSetPrimaryImage = async (imageId: string, categoryId: string) => {
    try {
      await setPrimaryCategoryImageAdmin(imageId)
      await fetchCategories()
      if (editing?.id === categoryId) {
        const updatedCats = await getAllCategoriesAdmin()
        const updatedCat = updatedCats.find(c => c.id === categoryId)
        if (updatedCat) setEditing(updatedCat)
      }
    } catch (err) {
      console.error('Set primary category image failed', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-text-muted">Loading categories...</p>
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
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-display font-bold text-text-main-light mb-6">
              {editing ? 'Edit Category' : 'New Category'}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Skincare"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Slug</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="skincare (auto-generated if empty)"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Parent Category</label>
                <select
                  value={form.parentId}
                  onChange={e => setForm(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary appearance-none"
                >
                  <option value="" className="bg-[#0a0a0a]">None (Top-level)</option>
                  {categories
                    .filter(c => c.id !== editing?.id)
                    .map(c => (
                      <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.name}</option>
                    ))
                  }
                </select>
              </div>

              {/* Category Images */}
              <div className="space-y-3 mt-4 pt-4 border-t border-primary/10">
                <label className="text-xs font-bold text-text-muted uppercase">Category Images</label>
                {editing ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          value={imageUrlInput}
                          onChange={e => {
                            setImageUrlInput(e.target.value)
                            if (imageError) setImageError(null)
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddImage(editing.id)
                            }
                          }}
                          placeholder="Image URL (https://...)"
                          className="flex-1 bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddImage(editing.id)}
                          disabled={addingImage || !imageUrlInput.trim()}
                          className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          {addingImage ? (
                            <span className="material-icons-outlined text-sm animate-spin">refresh</span>
                          ) : (
                            <span className="material-icons-outlined text-sm">add</span>
                          )}
                          Add
                        </button>
                      </div>
                      <input
                        value={imageAltInput}
                        onChange={e => setImageAltInput(e.target.value)}
                        placeholder="Alt text (optional)"
                        className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2 text-xs text-text-main-light outline-none focus:border-primary"
                      />
                      {imageError && (
                        <p className="text-xs text-red-400">{imageError}</p>
                      )}
                    </div>

                    {editing.images && editing.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 py-2">
                        {editing.images.map(img => (
                          <div key={img.id} className={`relative group rounded-xl border-2 overflow-hidden ${img.isPrimary ? 'border-primary shadow-[0_0_8px_rgba(212,175,55,0.3)]' : 'border-primary/10'}`}>
                            <div className="w-full aspect-square bg-background-main">
                              <img
                                src={img.url}
                                className="w-full h-full object-cover"
                                alt={img.altText || ''}
                                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image' }}
                              />
                            </div>
                            {img.isPrimary && (
                              <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow">
                                Primary
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {!img.isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(img.id, editing.id)}
                                  className="p-1.5 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors cursor-pointer"
                                  title="Set as primary image"
                                >
                                  <span className="material-icons-outlined text-sm">star</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(img.id, editing.id)}
                                className="p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition-colors cursor-pointer"
                                title="Delete image"
                              >
                                <span className="material-icons-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-background-main rounded-xl border border-primary/10 text-center">
                    <p className="text-xs text-text-muted">Save this category first to add images.</p>
                  </div>
                )}
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
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">Delete Category?</h3>
            <p className="text-sm text-text-muted mb-6">This action cannot be undone. All products linked to this category will be unlinked.</p>
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
          <h1 className="text-2xl font-display font-bold text-text-main-light">Categories</h1>
          <p className="text-sm text-text-muted mt-1">Manage your store's product taxonomy.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10 bg-background-main/50">
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider w-16">Image</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Name</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Slug</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Parent</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted text-sm">
                  No categories yet. Click "New Category" to create one.
                </td>
              </tr>
            )}
            {categories.map(cat => (
              <tr key={cat.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="w-10 h-10 rounded-lg bg-background-light border border-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                    {cat.images?.find(img => img.isPrimary)?.url || cat.images?.[0]?.url ? (
                      <img src={cat.images?.find(img => img.isPrimary)?.url || cat.images?.[0]?.url} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-icons-outlined text-text-muted text-sm">image</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-text-main-light">{cat.name}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-text-muted font-mono bg-background-main px-2 py-1 rounded">{cat.slug}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-text-muted">
                    {cat.parentId ? categories.find(c => c.id === cat.parentId)?.name || cat.parentId : '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                    >
                      <span className="material-icons-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
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

export default CategoryList
