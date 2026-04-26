import { useState, useEffect } from 'react'
import {
  getAllFeaturedSectionsAdmin,
  createFeaturedSectionAdmin,
  updateFeaturedSectionAdmin,
  deleteFeaturedSectionAdmin
} from '../../../api/admin/admin.combos.api'
import type { AdminFeaturedSection } from '../../../api/admin/admin.combos.api'

const sectionTypes = ['EXPERT_PICKS', 'HOMEPAGE_HERO', 'DEALS'] as const

const typeLabel: Record<string, { label: string; icon: string; color: string }> = {
  EXPERT_PICKS: { label: 'Expert Picks', icon: 'workspace_premium', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  HOMEPAGE_HERO: { label: 'Homepage Hero', icon: 'home', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  DEALS: { label: 'Deals', icon: 'local_offer', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
}

interface FormData {
  title: string
  type: string
  priority: number
}

const emptyForm: FormData = { title: '', type: 'EXPERT_PICKS', priority: 0 }

const FeaturedSectionList = () => {
  const [sections, setSections] = useState<AdminFeaturedSection[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AdminFeaturedSection | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchSections = async () => {
    try {
      const data = await getAllFeaturedSectionsAdmin()
      setSections(data)
    } catch (err) {
      console.error('Failed to fetch featured sections', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSections() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (section: AdminFeaturedSection) => {
    setEditing(section)
    setForm({ title: section.title, type: section.type, priority: section.priority })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = { title: form.title, type: form.type, priority: Number(form.priority) }
      if (editing) {
        await updateFeaturedSectionAdmin(editing.id, payload)
      } else {
        await createFeaturedSectionAdmin(payload)
      }
      setShowModal(false)
      setForm(emptyForm)
      setEditing(null)
      await fetchSections()
    } catch (err) {
      console.error('Failed to save section', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFeaturedSectionAdmin(id)
      setDeleteConfirm(null)
      await fetchSections()
    } catch (err) {
      console.error('Failed to delete section', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-text-muted">Loading featured sections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-display font-bold text-text-main-light mb-6">
              {editing ? 'Edit Section' : 'New Featured Section'}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Trending This Week"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {sectionTypes.map(t => {
                    const meta = typeLabel[t]
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, type: t }))}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          form.type === t
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-primary/10 bg-background-main text-text-muted hover:border-primary/30'
                        }`}
                      >
                        <span className="material-icons-outlined text-xl block mb-1">{meta.icon}</span>
                        <span className="text-[10px] font-bold uppercase">{meta.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Priority (lower = higher)</label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={e => setForm(prev => ({ ...prev, priority: Number(e.target.value) }))}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
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
                  disabled={saving || !form.title.trim()}
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
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">Delete Section?</h3>
            <p className="text-sm text-text-muted mb-6">This will permanently remove the featured section.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">Featured Sections</h1>
          <p className="text-sm text-text-muted mt-1">Control which sections appear on the storefront homepage.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Section
        </button>
      </div>

      {/* Cards */}
      {sections.length === 0 ? (
        <div className="bg-background-light rounded-2xl border border-primary/10 p-12 text-center">
          <span className="material-icons-outlined text-4xl text-primary/20 mb-3">star</span>
          <p className="text-sm text-text-muted">No featured sections yet. Create one to highlight products on the homepage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections
            .sort((a, b) => a.priority - b.priority)
            .map(section => {
              const meta = typeLabel[section.type] || typeLabel.EXPERT_PICKS
              return (
                <div
                  key={section.id}
                  className="bg-background-light rounded-2xl border border-primary/10 p-6 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${meta.color}`}>
                      <span className="material-icons-outlined text-2xl">{meta.icon}</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted bg-background-main px-2 py-1 rounded">
                      Priority: {section.priority}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-text-main-light mb-1">{section.title}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${meta.color}`}>
                    {meta.label}
                  </span>

                  {section.productCount !== undefined && (
                    <p className="text-xs text-text-muted mt-3">{section.productCount} products assigned</p>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary/5">
                    <button
                      onClick={() => openEdit(section)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-center bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(section.id)}
                      className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5"
                    >
                      <span className="material-icons-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default FeaturedSectionList
