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

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState<CreateAddressPayload>({
    fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India'
  })

  useEffect(() => {
    if (authLoading) return
    if (!authUser) {
      navigate('/auth')
      return
    }
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
        fullName: addr.fullName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || '',
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country
      })
    } else {
      setEditingAddressId(null)
      setAddressForm({
        fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India'
      })
    }
    setShowAddressModal(true)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/auth')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Logout failed'
      setError(msg)
    }
  }

  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`

  const totalSpent = orders.reduce((acc, order) => {
    if (order.paymentStatus === 'COMPLETED') return acc + order.totalAmount
    return acc
  }, 0)

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
            <h2 className="font-display text-2xl font-bold text-text-main-light mb-2">
              Error Loading Profile
            </h2>
            <p className="text-text-muted">{error}</p>
          </div>
          <button
            className="w-full py-3 px-4 rounded-2xl shadow-lg shadow-primary/20 font-bold text-black bg-primary hover:bg-primary-hover transition-all cursor-pointer active:scale-95"
            onClick={() => navigate('/')}
          >
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
          <button
            className="py-2 px-6 rounded-lg bg-primary text-black font-bold hover:bg-primary-hover transition-all"
            onClick={() => navigate('/auth')}
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light font-body">
      <Layout>
        {/* Header */}
        <div className="bg-surface-dark border-b border-primary/10">
          <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
            <h1 className="font-display text-2xl font-bold text-text-main-light">My Profile</h1>
            <button
              className="text-text-muted hover:text-primary transition-colors cursor-pointer active:scale-95"
              onClick={() => navigate('/')}
              aria-label="Close"
            >
              <span className="material-icons-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <div className="bg-surface-dark rounded-2xl shadow-sm p-8 text-center space-y-6 sticky top-24 border border-primary/10">
                {/* Avatar */}
                <div className="gradient-ring inline-block">
                  <div className="w-24 h-24 rounded-full bg-surface-dark flex items-center justify-center text-primary">
                    <span className="material-icons-outlined text-5xl">person</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold text-text-main-light">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username}
                  </h2>
                  <p className="text-sm text-text-muted">@{user.username}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                  <div>
                    <p className="text-2xl font-bold text-primary">{orders.length}</p>
                    <p className="text-xs text-text-muted">Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary price-glow">{formatPrice(totalSpent)}</p>
                    <p className="text-xs text-text-muted">Spent</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  className="w-full py-3 px-4 rounded-lg border border-red-800/50 text-red-400 hover:bg-red-900/20 transition-all font-semibold cursor-pointer active:scale-95"
                  onClick={handleLogout}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-icons-outlined text-lg">logout</span>
                    Logout
                  </span>
                </button>
              </div>
            </div>

            {/* Details Section */}
            <div className="md:col-span-2 space-y-6">
              {/* Account Information */}
              <div className="bg-surface-dark rounded-2xl shadow-sm p-8 space-y-6 border border-primary/10">
                <div>
                  <h3 className="font-display text-xl font-bold text-text-main-light mb-6">
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold tracking-widest text-primary/70 uppercase block mb-1">
                        Email
                      </label>
                      <p className="text-text-main-light">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold tracking-widest text-primary/70 uppercase block mb-1">
                        Username
                      </label>
                      <p className="text-text-main-light">@{user.username}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold tracking-widest text-primary/70 uppercase block mb-1">
                        Member Since
                      </label>
                      <p className="text-text-main-light">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-primary/10">
                  <button className="py-2 px-6 rounded-lg bg-primary text-black font-bold hover:bg-primary-hover transition-all cursor-pointer active:scale-95">
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Addresses */}
              <div className="bg-surface-dark rounded-2xl shadow-sm p-8 border border-primary/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-text-main-light">
                    My Addresses
                  </h3>
                  <button 
                    onClick={() => openAddressModal()}
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                  >
                    <span className="material-icons-outlined text-lg">add</span>
                    Add New
                  </button>
                </div>
                
                <div className="space-y-4">
                  {addressesLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-primary/10 rounded-xl">
                      <p className="text-text-muted text-sm mb-2">No addresses saved yet.</p>
                      <button onClick={() => openAddressModal()} className="text-primary text-sm font-semibold hover:underline cursor-pointer">
                        Add your first address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div key={addr.id} className={`p-4 rounded-xl border-2 transition-all ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-primary/10 bg-background-light'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-text-main-light">{addr.fullName}</p>
                              {addr.isDefault && (
                                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 text-text-muted">
                              <button onClick={() => openAddressModal(addr)} className="hover:text-primary transition-colors cursor-pointer" title="Edit">
                                <span className="material-icons-outlined text-lg">edit</span>
                              </button>
                              <button onClick={() => handleDeleteAddress(addr.id)} className="hover:text-red-400 transition-colors cursor-pointer" title="Delete">
                                <span className="material-icons-outlined text-lg">delete_outline</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed">
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                            {addr.city}, {addr.state} - {addr.pincode}<br />
                            📞 {addr.phone}
                          </p>
                          {!addr.isDefault && (
                            <button 
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="mt-3 text-xs font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-surface-dark rounded-2xl shadow-sm p-8 border border-primary/10">
                <h3 className="font-display text-xl font-bold text-text-main-light mb-6">
                  Recent Orders
                </h3>
                <div className="space-y-4">
                  {ordersLoading ? (
                    <div className="flex flex-col items-center py-8 space-y-2">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-sm text-text-muted">Fetching orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="material-icons-outlined text-4xl text-text-muted/30 mb-2">shopping_bag</span>
                      <p className="text-text-muted text-sm">No orders yet</p>
                      <button
                        className="text-primary text-sm font-bold mt-2 hover:underline cursor-pointer"
                        onClick={() => navigate('/shop')}
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border border-primary/10 rounded-xl hover:bg-surface-elevated hover:border-primary/20 transition-all cursor-pointer group card-lift"
                        onClick={() => navigate(`/order-confirmation/${order.id}`)}
                      >
                        <div>
                          <p className="font-semibold text-text-main-light group-hover:text-primary transition-colors">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-text-muted">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                          <p className={`text-xs font-semibold ${order.status === 'DELIVERED' ? 'text-green-400' :
                              order.status === 'CANCELLED' ? 'text-red-400' : 'text-primary/70'
                            }`}>
                            {order.status}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {orders.length > 5 && (
                  <button onClick={() => navigate('/orders')} className="w-full mt-6 py-3 px-4 rounded-lg border border-primary/30 text-primary hover:bg-primary hover:text-black transition-all font-semibold cursor-pointer active:scale-95">
                    View All Orders
                  </button>
                )}
              </div>

              {/* Preferences */}
              <div className="bg-surface-dark rounded-2xl shadow-sm p-8 border border-primary/10">
                <h3 className="font-display text-xl font-bold text-text-main-light mb-6">
                  Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-main-light">Email Notifications</p>
                      <p className="text-sm text-text-muted">Receive order updates</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                    <div>
                      <p className="font-semibold text-text-main-light">Marketing Emails</p>
                      <p className="text-sm text-text-muted">New products and offers</p>
                    </div>
                    <input type="checkbox" className="toggle-switch" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Modal */}
        {showAddressModal && (
          <>
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAddressModal(false)} />
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-surface-dark w-full max-w-lg rounded-2xl border border-primary/20 shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] animate-slideUp">
                <div className="flex items-center justify-between p-6 border-b border-primary/10 shrink-0">
                  <h2 className="font-display text-xl font-bold text-text-main-light">
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <button onClick={() => setShowAddressModal(false)} className="text-text-muted hover:text-primary transition-colors cursor-pointer">
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
                          className="w-full bg-background-light border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 border-t border-primary/10 shrink-0 bg-surface-dark rounded-b-2xl flex gap-3">
                  <button 
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 py-3 rounded-xl border border-primary/20 text-text-main-light font-bold hover:bg-surface-elevated transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveAddress}
                    className="flex-1 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary-hover transition-colors cursor-pointer glow-gold"
                  >
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
