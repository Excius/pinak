import { useState, useEffect } from 'react'
import {
  getFilterGroups,
  createFilterGroup,
  updateFilterGroup,
  deleteFilterGroup,
  createFilterValue,
  updateFilterValue,
  deleteFilterValue,
} from '../../../api/admin/admin.filters.api'
import type { AdminFilterGroup, AdminFilterValue } from '../../../api/admin/admin.filters.api'

// ── Form types ──────────────────────────────────────────────────────────

interface GroupFormData {
  name: string
  sortOrder: number
  isActive: boolean
}
interface ValueFormData {
  name: string
  sortOrder: number
}

const emptyGroupForm: GroupFormData = { name: '', sortOrder: 0, isActive: true }
const emptyValueForm: ValueFormData = { name: '', sortOrder: 0 }

// ── Component ───────────────────────────────────────────────────────────

const FilterGroupList = () => {
  const [groups, setGroups] = useState<AdminFilterGroup[]>([])
  const [loading, setLoading] = useState(true)

  // Group modal
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<AdminFilterGroup | null>(null)
  const [groupForm, setGroupForm] = useState<GroupFormData>(emptyGroupForm)
  const [saving, setSaving] = useState(false)

  // Value modal
  const [showValueModal, setShowValueModal] = useState(false)
  const [valueParentId, setValueParentId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<AdminFilterValue | null>(null)
  const [valueForm, setValueForm] = useState<ValueFormData>(emptyValueForm)
  const [savingValue, setSavingValue] = useState(false)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'group' | 'value'; id: string; label: string } | null>(null)

  // Expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchGroups = async () => {
    try {
      const data = await getFilterGroups()
      setGroups(data)
    } catch (err) {
      console.error('Failed to fetch filter groups', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroups() }, [])

  // ── Group CRUD ────────────────────────────────────────────────────────

  const openCreateGroup = () => {
    setEditingGroup(null)
    setGroupForm(emptyGroupForm)
    setShowGroupModal(true)
  }

  const openEditGroup = (group: AdminFilterGroup) => {
    setEditingGroup(group)
    setGroupForm({ name: group.name, sortOrder: group.sortOrder, isActive: group.isActive })
    setShowGroupModal(true)
  }

  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) return
    setSaving(true)
    try {
      if (editingGroup) {
        await updateFilterGroup(editingGroup.id, groupForm)
      } else {
        await createFilterGroup(groupForm)
      }
      setShowGroupModal(false)
      await fetchGroups()
    } catch (err) {
      console.error('Failed to save filter group', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteFilterGroup(id)
      setDeleteConfirm(null)
      await fetchGroups()
    } catch (err) {
      console.error('Failed to delete filter group', err)
    }
  }

  // ── Value CRUD ────────────────────────────────────────────────────────

  const openCreateValue = (groupId: string) => {
    setValueParentId(groupId)
    setEditingValue(null)
    setValueForm(emptyValueForm)
    setShowValueModal(true)
  }

  const openEditValue = (groupId: string, value: AdminFilterValue) => {
    setValueParentId(groupId)
    setEditingValue(value)
    setValueForm({ name: value.name, sortOrder: value.sortOrder })
    setShowValueModal(true)
  }

  const handleSaveValue = async () => {
    if (!valueForm.name.trim() || !valueParentId) return
    setSavingValue(true)
    try {
      if (editingValue) {
        await updateFilterValue(editingValue.id, valueForm)
      } else {
        await createFilterValue(valueParentId, valueForm)
      }
      setShowValueModal(false)
      await fetchGroups()
    } catch (err) {
      console.error('Failed to save filter value', err)
    } finally {
      setSavingValue(false)
    }
  }

  const handleDeleteValue = async (valueId: string) => {
    try {
      await deleteFilterValue(valueId)
      setDeleteConfirm(null)
      await fetchGroups()
    } catch (err) {
      console.error('Failed to delete filter value', err)
    }
  }

  // ── Toggle expand ─────────────────────────────────────────────────────

  const toggleExpand = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-text-muted">Loading filter groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Group Modal ──────────────────────────────────────────────── */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowGroupModal(false)} />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-display font-bold text-text-main-light mb-6">
              {editingGroup ? 'Edit Filter Group' : 'New Filter Group'}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Group Name *</label>
                <input
                  value={groupForm.name}
                  onChange={e => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Skin Type"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Sort Order</label>
                <input
                  type="number"
                  value={groupForm.sortOrder}
                  onChange={e => setGroupForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-main-light">Active</span>
                <button
                  type="button"
                  onClick={() => setGroupForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none cursor-pointer ${groupForm.isActive ? 'bg-primary' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${groupForm.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGroup}
                  disabled={saving || !groupForm.name.trim()}
                  className="flex-1 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingGroup ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Value Modal ──────────────────────────────────────────────── */}
      {showValueModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowValueModal(false)} />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-display font-bold text-text-main-light mb-6">
              {editingValue ? 'Edit Filter Value' : 'Add Filter Value'}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Value Name *</label>
                <input
                  value={valueForm.name}
                  onChange={e => setValueForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Oily"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Sort Order</label>
                <input
                  type="number"
                  value={valueForm.sortOrder}
                  onChange={e => setValueForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowValueModal(false)}
                  className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveValue}
                  disabled={savingValue || !valueForm.name.trim()}
                  className="flex-1 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingValue ? 'Saving...' : editingValue ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ──────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-background-light border border-red-500/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <span className="material-icons-outlined text-4xl text-red-500 mb-4">warning</span>
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">
              Delete {deleteConfirm.type === 'group' ? 'Filter Group' : 'Filter Value'}?
            </h3>
            <p className="text-sm text-text-muted mb-6">
              This will permanently remove <strong className="text-text-main-light">{deleteConfirm.label}</strong>
              {deleteConfirm.type === 'group' ? ' and all its values.' : '.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm.type === 'group' ? handleDeleteGroup(deleteConfirm.id) : handleDeleteValue(deleteConfirm.id)}
                className="flex-1 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">Filter Groups</h1>
          <p className="text-sm text-text-muted mt-1">Manage product filter groups and their values (e.g. Skin Type → Oily, Dry).</p>
        </div>
        <button
          onClick={openCreateGroup}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Group
        </button>
      </div>

      {/* ── Groups List (Accordion) ──────────────────────────────────── */}
      {groups.length === 0 ? (
        <div className="bg-background-light rounded-2xl border border-primary/10 p-12 text-center">
          <span className="material-icons-outlined text-5xl text-text-muted/30 mb-3">filter_alt</span>
          <p className="text-text-muted text-sm">No filter groups yet. Click "New Group" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => {
            const isExpanded = expandedGroups.has(group.id)
            return (
              <div key={group.id} className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden transition-all">
                {/* Group row */}
                <div className="flex items-center px-6 py-4 hover:bg-primary/[0.02] transition-colors">
                  <button
                    onClick={() => toggleExpand(group.id)}
                    className="mr-3 text-text-muted hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className={`material-icons-outlined text-lg transition-transform ${isExpanded ? 'rotate-90' : ''}`}>chevron_right</span>
                  </button>

                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(group.id)}>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-text-main-light">{group.name}</p>
                      <span className="text-xs text-text-muted font-mono bg-background-main px-2 py-0.5 rounded">{group.slug}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        group.isActive
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${group.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        {group.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {group.values?.length || 0} value{(group.values?.length || 0) !== 1 ? 's' : ''} · Sort: {group.sortOrder}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openCreateValue(group.id)}
                      className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5 cursor-pointer"
                      title="Add value"
                    >
                      <span className="material-icons-outlined text-lg">add_circle_outline</span>
                    </button>
                    <button
                      onClick={() => openEditGroup(group)}
                      className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5 cursor-pointer"
                      title="Edit group"
                    >
                      <span className="material-icons-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'group', id: group.id, label: group.name })}
                      className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5 cursor-pointer"
                      title="Delete group"
                    >
                      <span className="material-icons-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>

                {/* Values (expandable) */}
                {isExpanded && (
                  <div className="border-t border-primary/5 bg-background-main/30">
                    {(!group.values || group.values.length === 0) ? (
                      <div className="px-6 py-6 text-center">
                        <p className="text-text-muted text-xs mb-2">No values in this group yet.</p>
                        <button
                          onClick={() => openCreateValue(group.id)}
                          className="text-primary text-xs font-semibold hover:underline cursor-pointer"
                        >
                          + Add first value
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-primary/5">
                        {group.values.map(value => (
                          <div key={value.id} className="flex items-center px-6 py-3 pl-14 hover:bg-primary/[0.02] transition-colors">
                            <span className="material-icons-outlined text-text-muted/40 text-sm mr-3">label</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-text-main-light">{value.name}</p>
                              <p className="text-[10px] text-text-muted font-mono">{value.slug} · Sort: {value.sortOrder}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openEditValue(group.id, value)}
                                className="p-1.5 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5 cursor-pointer"
                              >
                                <span className="material-icons-outlined text-base">edit</span>
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'value', id: value.id, label: value.name })}
                                className="p-1.5 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5 cursor-pointer"
                              >
                                <span className="material-icons-outlined text-base">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FilterGroupList
