import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../api/cart.api'
import type { Order } from '../api/cart.api'
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../api/addresses.api'
import type { Address, CreateAddressPayload } from '../api/addresses.api'

interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  name?: string
  avatar?: string
  createdAt?: string
}

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { user: authUser, isLoading: authLoading, logout } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [error, setError] = useState('')

  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState<CreateAddressPayload>({
    fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India'
  })

  useEffect(() => {
    if (authLoading) return
    if (!authUser) { navigate('/auth'); return }
    setUser(authUser as User)
    setLoading(false)
  }, [authUser, authLoading, navigate])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) return
      setOrdersLoading(true)
      setAddressesLoading(true)
      try {
        const [ordersData, addrData] = await Promise.all([
          getMyOrders().catch(() => ({ items: [] })),
          getAddresses().catch(() => [])
        ])
        setOrders(ordersData.items || [])
        setAddresses(addrData || [])
      } catch (err) {
        console.error('Failed to fetch user data', err)
      } finally {
        setOrdersLoading(false)
        setAddressesLoading(false)
      }
    }
    fetchUserData()
  }, [authUser])

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSaveAddress = async () => {
    try {
      if (editingAddressId) {
        const updated = await updateAddress(editingAddressId, addressForm)
        setAddresses(prev => prev.map(a => a.id === updated.id ? updated : a))
      } else {
        const saved = await createAddress(addressForm)
        setAddresses(prev => [...prev, saved])
      }
      setShowAddressModal(false)
    } catch (err: any) {
      console.error('Failed to save address', err)
      alert(err?.response?.data?.message || 'Failed to save address')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    try {
      await deleteAddress(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('Failed to delete address', err)
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await setDefaultAddress(id)
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
    } catch (err) {
      console.error('Failed to set default address', err)
    }
  }

  const openAddressModal = (addr?: Address) => {
    if (addr) {
      setEditingAddressId(addr.id)
      setAddressForm({
        fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || '', city: addr.city, state: addr.state,
        pincode: addr.pincode, country: addr.country
      })
    } else {
      setEditingAddressId(null)
      setAddressForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India' })
    }
    setShowAddressModal(true)
  }

  const handleLogout = async () => {
    try { await logout(); navigate('/auth') }
    catch (err: any) { setError(err?.response?.data?.message || err?.message || 'Logout failed') }
  }

  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`

  const totalSpent = orders.reduce((acc, o) => o.paymentStatus === 'COMPLETED' ? acc + o.totalAmount : acc, 0)

  const getInitials = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    if (user?.username) return user.username.slice(0, 2).toUpperCase()
    return 'U'
  }

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`
    return user?.username || ''
  }

  const getMemberDuration = () => {
    if (!user?.createdAt) return 'N/A'
    const diff = Date.now() - new Date(user.createdAt).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days < 30) return `${days} days`
    if (days < 365) return `${Math.floor(days / 30)} months`
    return `${Math.floor(days / 365)}+ years`
  }

  const getStatusColor = (status: string) => {
    if (status === 'DELIVERED') return 'bg-emerald-500'
    if (status === 'CANCELLED') return 'bg-red-500'
    return 'bg-primary'
  }

  const getStatusTextColor = (status: string) => {
    if (status === 'DELIVERED') return 'text-emerald-400'
    if (status === 'CANCELLED') return 'text-red-400'
    return 'text-primary'
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background-light font-body">
        <div className="text-center space-y-4">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
            <span className="material-icons-outlined text-3xl text-primary">person</span>
          </div>
          <p className="text-text-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background-light font-body px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-900/30 border border-red-800/50">
            <span className="material-icons-outlined text-3xl text-red-400">error</span>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-text-main-light mb-2">Error Loading Profile</h2>
            <p className="text-text-muted">{error}</p>
          </div>
          <button className="w-full py-3 px-4 rounded-2xl shadow-lg shadow-primary/20 font-bold text-black bg-primary hover:bg-primary-hover transition-all cursor-pointer active:scale-95" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background-light font-body">
        <div className="text-center space-y-4">
          <p className="text-text-muted">No user data found</p>
          <button className="py-2 px-6 rounded-lg bg-primary text-black font-bold hover:bg-primary-hover transition-all" onClick={() => navigate('/auth')}>Login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light font-body">
      <Layout>
        {/* ── Hero Banner ── */}
        <div className="profile-hero">
          <div className="max-w-5xl mx-auto px-6 pt-12 pb-16 md:pt-16 md:pb-20 relative z-10">
            <div className="profile-animate flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="profile-avatar-ring">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-background-dark flex items-center justify-center">
                  <span className="text-gold-gradient font-display text-4xl md:text-5xl font-black tracking-tight">
                    {getInitials()}
                  </span>
                </div>
              </div>

              {/* Name & Meta */}
              <div className="text-center md:text-left flex-1">
                <h1 className="font-display text-3xl md:text-4xl font-black text-text-main-light tracking-tight mb-1">
                  {getDisplayName()}
                </h1>
                <p className="text-text-muted text-sm mb-4">@{user.username}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary/80 bg-primary/8 border border-primary/12 rounded-full px-3 py-1.5">
                    <span className="material-icons-outlined text-sm">verified</span>
                    Verified Member
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-white/5 border border-white/8 rounded-full px-3 py-1.5">
                    <span className="material-icons-outlined text-sm">schedule</span>
                    Member for {getMemberDuration()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 shrink-0">
                <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-text-muted hover:text-text-main-light hover:border-white/15 transition-all cursor-pointer" aria-label="Home">
                  <span className="material-icons-outlined text-xl">home</span>
                </button>
                <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-red-500/8 border border-red-500/15 flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/15 hover:border-red-500/25 transition-all cursor-pointer" aria-label="Logout">
                  <span className="material-icons-outlined text-xl">logout</span>
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="profile-animate profile-animate-d1 grid grid-cols-3 gap-4 mt-10 max-w-xl mx-auto md:mx-0">
              <div className="profile-stat-card">
                <p className="text-2xl md:text-3xl font-black text-primary font-display">{orders.length}</p>
                <p className="text-[11px] text-text-muted uppercase tracking-widest font-semibold mt-1">Orders</p>
              </div>
              <div className="profile-stat-card">
                <p className="text-2xl md:text-3xl font-black text-primary font-display price-glow">{formatPrice(totalSpent)}</p>
                <p className="text-[11px] text-text-muted uppercase tracking-widest font-semibold mt-1">Total Spent</p>
              </div>
              <div className="profile-stat-card">
                <p className="text-2xl md:text-3xl font-black text-primary font-display">{addresses.length}</p>
                <p className="text-[11px] text-text-muted uppercase tracking-widest font-semibold mt-1">Addresses</p>
              </div>
            </div>
          </div>
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background-light to-transparent pointer-events-none" />
        </div>

        {/* ── Main Content ── */}
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Account Information */}
          <div className="profile-section p-8 profile-animate profile-animate-d2">
            <div className="profile-section-header">
              <div className="profile-section-icon">
                <span className="material-icons-outlined text-xl">person</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-text-main-light">Account Information</h3>
                <p className="text-xs text-text-muted mt-0.5">Your personal details</p>
              </div>
            </div>
            <div>
              {[
                { icon: 'email', label: 'Email Address', value: user.email },
                { icon: 'alternate_email', label: 'Username', value: `@${user.username}` },
                { icon: 'calendar_today', label: 'Member Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
              ].map((f) => (
                <div key={f.icon} className="profile-info-field">
                  <div className="profile-info-icon">
                    <span className="material-icons-outlined text-lg">{f.icon}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">{f.label}</p>
                    <p className="text-text-main-light font-medium">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses */}
          <div className="profile-section p-8 profile-animate profile-animate-d3">
            <div className="profile-section-header">
              <div className="profile-section-icon">
                <span className="material-icons-outlined text-xl">location_on</span>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-text-main-light">Saved Addresses</h3>
                <p className="text-xs text-text-muted mt-0.5">Manage your delivery addresses</p>
              </div>
              <button onClick={() => openAddressModal()} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer bg-primary/8 border border-primary/15 rounded-xl px-4 py-2 hover:bg-primary/12">
                <span className="material-icons-outlined text-lg">add</span>Add New
              </button>
            </div>

            {addressesLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-primary/10 rounded-2xl">
                <span className="material-icons-outlined text-4xl text-text-muted/20 mb-3 block">home</span>
                <p className="text-text-muted text-sm mb-3">No addresses saved yet</p>
                <button onClick={() => openAddressModal()} className="text-primary text-sm font-semibold hover:underline cursor-pointer">Add your first address →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`profile-address-card ${addr.isDefault ? 'is-default' : ''}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-text-main-light">{addr.fullName}</p>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2.5 py-0.5 rounded-full">
                            <span className="material-icons-outlined text-xs">star</span> Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openAddressModal(addr)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all cursor-pointer" title="Edit">
                          <span className="material-icons-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer" title="Delete">
                          <span className="material-icons-outlined text-base">delete_outline</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                      {addr.city}, {addr.state} – {addr.pincode}<br />
                      📞 {addr.phone}
                    </p>
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefaultAddress(addr.id)} className="mt-3 text-xs font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer">
                        Set as Default
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="profile-section p-8 profile-animate profile-animate-d4">
            <div className="profile-section-header">
              <div className="profile-section-icon">
                <span className="material-icons-outlined text-xl">receipt_long</span>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-text-main-light">Recent Orders</h3>
                <p className="text-xs text-text-muted mt-0.5">Track your purchase history</p>
              </div>
              {orders.length > 0 && (
                <button onClick={() => navigate('/orders')} className="text-xs font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer">
                  View All →
                </button>
              )}
            </div>

            <div className="space-y-3">
              {ordersLoading ? (
                <div className="flex flex-col items-center py-10 space-y-3">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-text-muted">Fetching orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-icons-outlined text-5xl text-text-muted/15 mb-3 block">shopping_bag</span>
                  <p className="text-text-muted text-sm mb-3">No orders yet</p>
                  <button className="text-primary text-sm font-bold hover:underline cursor-pointer" onClick={() => navigate('/shop')}>
                    Start Shopping →
                  </button>
                </div>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="profile-order-item" onClick={() => navigate(`/order-confirmation/${order.id}`)}>
                    <div className={`profile-order-dot ${getStatusColor(order.status)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-main-light text-sm">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-sm">{formatPrice(order.totalAmount)}</p>
                      <p className={`text-[11px] font-semibold ${getStatusTextColor(order.status)}`}>{order.status}</p>
                    </div>
                    <span className="material-icons-outlined text-lg text-text-muted/40">chevron_right</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="profile-section p-8 profile-animate profile-animate-d4">
            <div className="profile-section-header">
              <div className="profile-section-icon">
                <span className="material-icons-outlined text-xl">tune</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-text-main-light">Preferences</h3>
                <p className="text-xs text-text-muted mt-0.5">Notification settings</p>
              </div>
            </div>
            <div className="space-y-1">
              {[
                { icon: 'notifications_active', title: 'Email Notifications', desc: 'Receive order updates & tracking info', checked: true },
                { icon: 'campaign', title: 'Marketing Emails', desc: 'New products, offers & promotions', checked: false },
              ].map((pref, i) => (
                <div key={i} className={`flex items-center gap-4 py-4 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                  <div className="profile-info-icon">
                    <span className="material-icons-outlined text-lg">{pref.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-main-light text-sm">{pref.title}</p>
                    <p className="text-xs text-text-muted">{pref.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={pref.checked} className="toggle-switch" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Address Modal ── */}
        {showAddressModal && (
          <>
            <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setShowAddressModal(false)} />
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-surface-dark w-full max-w-lg rounded-2xl border border-primary/15 shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] animate-slideUp">
                <div className="flex items-center justify-between p-6 border-b border-primary/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="profile-section-icon">
                      <span className="material-icons-outlined text-lg">{editingAddressId ? 'edit_location' : 'add_location'}</span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-text-main-light">
                      {editingAddressId ? 'Edit Address' : 'Add New Address'}
                    </h2>
                  </div>
                  <button onClick={() => setShowAddressModal(false)} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:bg-white/10 transition-all cursor-pointer">
                    <span className="material-icons-outlined">close</span>
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'fullName', label: 'Full Name', placeholder: 'John Doe', full: false },
                      { name: 'phone', label: 'Phone', placeholder: '+91 98765 43210', full: false },
                      { name: 'addressLine1', label: 'Address Line 1', placeholder: '123 Main Street', full: true },
                      { name: 'addressLine2', label: 'Address Line 2 (Optional)', placeholder: 'Apt, Suite', full: true },
                      { name: 'city', label: 'City', placeholder: 'Mumbai', full: false },
                      { name: 'state', label: 'State', placeholder: 'Maharashtra', full: false },
                      { name: 'pincode', label: 'Pincode', placeholder: '400001', full: false },
                    ].map(f => (
                      <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">{f.label}</label>
                        <input
                          name={f.name}
                          value={(addressForm as any)[f.name] || ''}
                          onChange={handleAddressFormChange}
                          placeholder={f.placeholder}
                          className="w-full bg-background-light border border-primary/15 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-primary/10 shrink-0 bg-surface-dark rounded-b-2xl flex gap-3">
                  <button onClick={() => setShowAddressModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-text-main-light font-bold hover:bg-white/5 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={handleSaveAddress} className="flex-1 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary-hover transition-colors cursor-pointer glow-gold">
                    Save Address
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </Layout>
    </div>
  )
}

export default Profile
