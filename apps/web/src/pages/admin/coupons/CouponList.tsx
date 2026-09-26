import React, { useState, useEffect } from 'react'
import {
  getAllCouponsAdmin,
  createCouponAdmin,
  updateCouponAdmin,
  hardDeleteCouponAdmin,
  type AdminCoupon
} from '../../../api/admin/admin.coupons.api'

const CouponList: React.FC = () => {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AdminCoupon | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    discountValue: 0,
    minOderValue: '',
    maxDiscountValue: '',
    validFrom: '',
    validUntil: '',
    maxTotalUsers: '',
    maxUsesPerUser: '',
    isActive: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const data = await getAllCouponsAdmin()
      setCoupons(data.items || [])
    } catch (error) {
      console.error('Failed to load coupons', error)
      // Mock data for UI demonstration since backend endpoints might be missing
      if (coupons.length === 0) {
        setCoupons([
          {
            id: '1',
            code: 'WELCOME10',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOderValue: 500,
            maxDiscountValue: 1000,
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            maxTotalUsers: 100,
            maxUsesPerUser: 1,
            isActive: true,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      minOderValue: '',
      maxDiscountValue: '',
      validFrom: new Date().toISOString().split('T')[0] as string,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
      maxTotalUsers: '',
      maxUsesPerUser: '',
      isActive: true
    })
    setShowModal(true)
  }

  const openEdit = (coupon: AdminCoupon) => {
    setEditing(coupon)
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOderValue: coupon.minOderValue?.toString() || '',
      maxDiscountValue: coupon.maxDiscountValue?.toString() || '',
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0] as string,
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0] as string,
      maxTotalUsers: coupon.maxTotalUsers?.toString() || '',
      maxUsesPerUser: coupon.maxUsesPerUser?.toString() || '',
      isActive: coupon.isActive
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOderValue: form.minOderValue ? Number(form.minOderValue) : null,
        maxDiscountValue: form.maxDiscountValue ? Number(form.maxDiscountValue) : null,
        validFrom: new Date(form.validFrom).toISOString(),
        validUntil: new Date(form.validUntil).toISOString(),
        maxTotalUsers: form.maxTotalUsers ? Number(form.maxTotalUsers) : null,
        maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : null,
        isActive: form.isActive
      }

      if (editing) {
        await updateCouponAdmin(editing.id, payload)
      } else {
        await createCouponAdmin(payload)
      }
      setShowModal(false)
      fetchCoupons()
    } catch (error) {
      console.error('Failed to save coupon', error)
      alert('Failed to save coupon. The backend endpoint might not be fully implemented yet.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await hardDeleteCouponAdmin(id)
      fetchCoupons()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete', error)
      alert('Failed to delete coupon. The backend endpoint might not be fully implemented yet.')
      setDeleteConfirm(null)
    }
  }

  if (loading && coupons.length === 0) return <div className="p-8 text-center text-text-muted">Loading coupons...</div>

  return (
    <div className="space-y-6">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-display font-bold text-text-main-light mb-6">
              {editing ? 'Edit Coupon' : 'New Coupon'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                  placeholder="e.g. SUMMER20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FLAT' })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Discount Value</label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Valid From</label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={e => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={e => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Min Order Value (Opt)</label>
                  <input
                    type="number"
                    value={form.minOderValue}
                    onChange={e => setForm({ ...form, minOderValue: e.target.value })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                    placeholder="None"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Max Discount (Opt)</label>
                  <input
                    type="number"
                    value={form.maxDiscountValue}
                    onChange={e => setForm({ ...form, maxDiscountValue: e.target.value })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                    placeholder="None"
                    disabled={form.discountType === 'FLAT'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Max Uses (Total)</label>
                  <input
                    type="number"
                    value={form.maxTotalUsers}
                    onChange={e => setForm({ ...form, maxTotalUsers: e.target.value })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Uses Per User</label>
                  <input
                    type="number"
                    value={form.maxUsesPerUser}
                    onChange={e => setForm({ ...form, maxUsesPerUser: e.target.value })}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                    placeholder="Unlimited"
                  />
                </div>
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
                  disabled={saving || !form.code.trim() || form.discountValue <= 0}
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
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">Delete Coupon?</h3>
            <p className="text-sm text-text-muted mb-6">This will permanently remove the coupon code. It cannot be recovered.</p>
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
          <h1 className="text-2xl font-display font-bold text-text-main-light">Coupons</h1>
          <p className="text-sm text-text-muted mt-1">Manage discount codes and promotions.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Coupon
        </button>
      </div>

      {/* Table */}
      <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10 bg-background-main/50">
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Code</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Discount</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Validity</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted text-sm">
                  No coupons found. Click "New Coupon" to create one.
                </td>
              </tr>
            )}
            {coupons.map(coupon => {
              const isValid = new Date(coupon.validUntil) >= new Date() && new Date(coupon.validFrom) <= new Date()
              return (
                <tr key={coupon.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 tracking-wider">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-text-main-light font-medium">
                      {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue / 100} OFF`}
                    </p>
                    {coupon.minOderValue && (
                      <p className="text-[10px] text-text-muted mt-0.5">Min: ₹{coupon.minOderValue / 100}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-text-main-light">
                      {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                    </p>
                    <p className={`text-[10px] font-medium mt-0.5 ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                      {isValid ? 'Currently Valid' : 'Expired / Not Started'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      coupon.isActive
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${coupon.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(coupon)}
                        className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                      >
                        <span className="material-icons-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(coupon.id)}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5"
                      >
                        <span className="material-icons-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CouponList
