import { useState, useEffect } from 'react'
import {
  getAllTaxClasses, createTaxClass, updateTaxClass, deleteTaxClass,
  getAllWeightClasses, createWeightClass, updateWeightClass, deleteWeightClass,
  getAllLengthClasses, createLengthClass, updateLengthClass, deleteLengthClass
} from '../../../api/admin/admin.settings.api'
import type { TaxClass, WeightClass, LengthClass } from '../../../api/admin/admin.settings.api'

type Tab = 'tax' | 'weight' | 'length'

// Generic editable table section
function ConfigTable<T extends { id: string }>({
  title, icon, items, columns, onAdd, onEdit, onDelete
}: {
  title: string
  icon: string
  items: T[]
  columns: { key: keyof T; label: string; type?: 'number' }[]
  onAdd: (data: Record<string, string>) => Promise<void>
  onEdit: (id: string, data: Record<string, string>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const openAdd = () => {
    setEditingId(null)
    const empty: Record<string, string> = {}
    columns.forEach(c => { empty[c.key as string] = '' })
    setForm(empty)
    setShowForm(true)
  }

  const openEdit = (item: T) => {
    setEditingId(item.id)
    const data: Record<string, string> = {}
    columns.forEach(c => { data[c.key as string] = String((item as any)[c.key] ?? '') })
    setForm(data)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingId) {
        await onEdit(editingId, form)
      } else {
        await onAdd(form)
      }
      setShowForm(false)
    } catch (err) {
      console.error('Save failed', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden">
      <div className="p-5 border-b border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
            <span className="material-icons-outlined text-primary text-lg">{icon}</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main-light">{title}</h3>
            <p className="text-[10px] text-text-muted">{items.length} entries</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-icons-outlined text-sm">add</span>
          Add New
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="p-4 bg-background-main/50 border-b border-primary/10">
          <div className="flex items-end gap-3">
            {columns.map(col => (
              <div key={col.key as string} className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">{col.label}</label>
                <input
                  type={col.type === 'number' ? 'number' : 'text'}
                  value={form[col.key as string] || ''}
                  onChange={e => setForm(prev => ({ ...prev, [col.key as string]: e.target.value }))}
                  className="w-full bg-background-main border border-primary/20 rounded-lg px-3 py-2 text-sm text-text-main-light outline-none focus:border-primary"
                />
              </div>
            ))}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold border border-primary/20 text-text-muted hover:bg-primary/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white disabled:opacity-50"
              >
                {saving ? '...' : editingId ? 'Update' : 'Add'}
              </button>
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
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">Delete Entry?</h3>
            <p className="text-sm text-text-muted mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5">Cancel</button>
              <button onClick={async () => { await onDelete(deleteConfirm); setDeleteConfirm(null) }} className="flex-1 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-primary/5 bg-background-main/30">
            {columns.map(col => (
              <th key={col.key as string} className="text-left px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">{col.label}</th>
            ))}
            <th className="text-right px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={columns.length + 1} className="px-5 py-8 text-center text-text-muted text-sm">No entries yet.</td></tr>
          )}
          {items.map(item => (
            <tr key={item.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors">
              {columns.map(col => (
                <td key={col.key as string} className="px-5 py-3 text-sm text-text-main-light">
                  {col.type === 'number' ? (
                    <span className="font-mono text-primary">{String((item as any)[col.key])}</span>
                  ) : (
                    String((item as any)[col.key])
                  )}
                </td>
              ))}
              <td className="px-5 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-text-muted hover:text-primary transition-colors rounded hover:bg-primary/5">
                    <span className="material-icons-outlined text-base">edit</span>
                  </button>
                  <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-text-muted hover:text-red-500 transition-colors rounded hover:bg-red-500/5">
                    <span className="material-icons-outlined text-base">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const SettingsPage = () => {
  const [tab, setTab] = useState<Tab>('tax')
  const [taxClasses, setTaxClasses] = useState<TaxClass[]>([])
  const [weightClasses, setWeightClasses] = useState<WeightClass[]>([])
  const [lengthClasses, setLengthClasses] = useState<LengthClass[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [tc, wc, lc] = await Promise.all([
        getAllTaxClasses(),
        getAllWeightClasses(),
        getAllLengthClasses()
      ])
      setTaxClasses(tc)
      setWeightClasses(wc)
      setLengthClasses(lc)
    } catch (err) {
      console.error('Failed to fetch settings', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const tabs: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: 'tax', label: 'Tax Classes', icon: 'receipt_long', count: taxClasses.length },
    { key: 'weight', label: 'Weight Classes', icon: 'scale', count: weightClasses.length },
    { key: 'length', label: 'Length Classes', icon: 'straighten', count: lengthClasses.length },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-text-muted">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-main-light">Store Settings</h1>
        <p className="text-sm text-text-muted mt-1">Configure tax rates, weight units, and length units for your catalog.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t.key
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-text-muted hover:bg-background-main border border-transparent'
            }`}
          >
            <span className="material-icons-outlined text-lg">{t.icon}</span>
            {t.label}
            <span className="text-[10px] ml-1 opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'tax' && (
        <ConfigTable<TaxClass>
          title="Tax Classes"
          icon="receipt_long"
          items={taxClasses}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'rate', label: 'Rate (%)', type: 'number' }
          ]}
          onAdd={async (data) => { await createTaxClass({ name: data.name ?? '', rate: Number(data.rate) }); await fetchAll() }}
          onEdit={async (id, data) => { await updateTaxClass(id, { name: data.name ?? '', rate: Number(data.rate) }); await fetchAll() }}
          onDelete={async (id) => { await deleteTaxClass(id); await fetchAll() }}
        />
      )}

      {tab === 'weight' && (
        <ConfigTable<WeightClass>
          title="Weight Classes"
          icon="scale"
          items={weightClasses}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'unit', label: 'Unit (e.g. kg, g, lb)' }
          ]}
          onAdd={async (data) => { await createWeightClass({ name: data.name ?? '', unit: data.unit ?? '' }); await fetchAll() }}
          onEdit={async (id, data) => { await updateWeightClass(id, { name: data.name ?? '', unit: data.unit ?? '' }); await fetchAll() }}
          onDelete={async (id) => { await deleteWeightClass(id); await fetchAll() }}
        />
      )}

      {tab === 'length' && (
        <ConfigTable<LengthClass>
          title="Length Classes"
          icon="straighten"
          items={lengthClasses}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'unit', label: 'Unit (e.g. cm, m, in)' }
          ]}
          onAdd={async (data) => { await createLengthClass({ name: data.name ?? '', unit: data.unit ?? '' }); await fetchAll() }}
          onEdit={async (id, data) => { await updateLengthClass(id, { name: data.name ?? '', unit: data.unit ?? '' }); await fetchAll() }}
          onDelete={async (id) => { await deleteLengthClass(id); await fetchAll() }}
        />
      )}
    </div>
  )
}

export default SettingsPage
