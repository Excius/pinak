import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getAddresses, createAddress } from '../api/addresses.api'
import { validateCoupon } from '../api/coupons.api'
import { createOrder } from '../api/cart.api'
import type { Address, CreateAddressPayload } from '../api/addresses.api'
import type { CouponValidation } from '../api/coupons.api'

const emptyAddress: CreateAddressPayload = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '', country: 'India',
}

const steps = ['Address', 'Review & Pay']

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { items, subtotal, taxTotal, totalWithTax, refreshCart } = useCart()

  // State
  const [currentStep, setCurrentStep] = useState(0)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState<CreateAddressPayload>(emptyAddress)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [savingAddress, setSavingAddress] = useState(false)

  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<CouponValidation | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Order
  const [placing, setPlacing] = useState(false)
  const [orderError, setOrderError] = useState('')

  const discountAmount = couponResult?.valid ? (couponResult.discountAmount || 0) : 0
  const cartTotal = totalWithTax ?? subtotal
  const finalTotal = Math.max(0, cartTotal - discountAmount)

  // Redirect if empty cart
  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }
    if (items.length === 0) { navigate('/'); return }
  }, [isAuthenticated, items.length, navigate])

  // Load addresses
  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true)
    try {
      const data = await getAddresses()
      setAddresses(data)
      const def = data.find(a => a.isDefault)
      if (def) setSelectedAddressId(def.id)
      else if (data.length > 0) setSelectedAddressId(data[0]?.id || null)
    } catch { /* ignore */ } finally { setLoadingAddresses(false) }
  }, [])

  useEffect(() => { fetchAddresses() }, [fetchAddresses])

  const selectedAddress = addresses.find(a => a.id === selectedAddressId)

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSaveAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) return
    setSavingAddress(true)
    try {
      const saved = await createAddress(newAddress)
      setAddresses(prev => [...prev, saved])
      setSelectedAddressId(saved.id)
      setShowNewAddress(false)
      setNewAddress(emptyAddress)
    } catch (err: any) {
      setOrderError(err?.response?.data?.message || 'Failed to save address')
    } finally { setSavingAddress(false) }
  }

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    setCouponError('')
    setCouponResult(null)
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal)
      setCouponResult(result)
      if (!result.valid) setCouponError(result.message || 'Invalid coupon')
    } catch (err: any) {
      setCouponError(err?.response?.data?.message || 'Failed to validate coupon')
    } finally { setValidatingCoupon(false) }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return
    setPlacing(true)
    setOrderError('')
    try {
      const shippingAddress = {
        fullName: selectedAddress.fullName,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2 || undefined,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        phone: selectedAddress.phone,
      }
      const payload: any = { shippingAddress }
      if (couponResult?.valid && couponCode.trim()) payload.couponCode = couponCode.trim()
      const result = await createOrder(payload)
      await refreshCart()
      navigate(`/order-confirmation/${result.order.id}`)
    } catch (err: any) {
      setOrderError(err?.response?.data?.message || err?.message || 'Failed to place order')
    } finally { setPlacing(false) }
  }

  const canProceedToReview = !!selectedAddressId
  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`

  const getItemName = (item: typeof items[0]) => {
    if (item.itemType === 'COMBO_KIT' && item.comboKit) return item.comboKit.name
    if (item.productVariant?.product) return item.productVariant.product.name
    return 'Unknown Item'
  }
  const getItemImage = (item: typeof items[0]) => {
    if (item.itemType === 'COMBO_KIT' && item.comboKit) return item.comboKit.imageUrl
    if (item.productVariant?.image) return item.productVariant.image.url
    return item.productVariant?.product?.frontImageUrl || null
  }
  const getItemVariant = (item: typeof items[0]) => {
    if (!item.productVariant?.optionValues?.length) return null
    return item.productVariant.optionValues.map(o => `${o.optionName}: ${o.valueName}`).join(' · ')
  }

  if (items.length === 0) return null

  return (
    <Layout>
      <div className="min-h-screen bg-background-light">
        {/* Header */}
        <div className="bg-surface-dark border-b border-primary/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-4 cursor-pointer">
              <span className="material-icons-outlined text-lg">arrow_back</span>
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-main-light">Checkout</h1>
            {/* Step indicator */}
            <div className="flex items-center gap-3 mt-4">
              {steps.map((step, i) => (
                <React.Fragment key={step}>
                  <button
                    onClick={() => { if (i < currentStep) setCurrentStep(i) }}
                    className={`flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer ${i === currentStep ? 'text-primary' : i < currentStep ? 'text-green-400' : 'text-text-muted/50'}`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i === currentStep ? 'border-primary bg-primary/10 text-primary' : i < currentStep ? 'border-green-400 bg-green-400/10 text-green-400' : 'border-primary/20 text-text-muted/50'}`}>
                      {i < currentStep ? <span className="material-icons-outlined text-sm">check</span> : i + 1}
                    </span>
                    <span className="hidden sm:inline">{step}</span>
                  </button>
                  {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded-full transition-colors ${i < currentStep ? 'bg-green-400/50' : 'bg-primary/10'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* STEP 0: Address Selection */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-text-main-light flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">location_on</span>
                    Select Delivery Address
                  </h2>

                  {loadingAddresses ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      {addresses.length === 0 && !showNewAddress && (
                        <div className="text-center py-10 bg-surface-dark rounded-2xl border border-primary/10">
                          <span className="material-icons-outlined text-4xl text-text-muted/30 mb-3 block">home</span>
                          <p className="text-text-muted mb-4">No saved addresses yet</p>
                          <button onClick={() => setShowNewAddress(true)} className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95">
                            Add Your First Address
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {addresses.map(addr => (
                          <button
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`relative text-left p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                              selectedAddressId === addr.id
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                : 'border-primary/10 bg-surface-dark hover:border-primary/30'
                            }`}
                          >
                            {addr.isDefault && (
                              <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full">Default</span>
                            )}
                            {selectedAddressId === addr.id && (
                              <span className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <span className="material-icons-outlined text-black text-xs">check</span>
                              </span>
                            )}
                            <p className="font-semibold text-text-main-light text-sm">{addr.fullName}</p>
                            <p className="text-xs text-text-muted mt-1 leading-relaxed">
                              {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                              {addr.city}, {addr.state} — {addr.pincode}<br />
                              📞 {addr.phone}
                            </p>
                          </button>
                        ))}
                      </div>

                      {/* Add new address toggle */}
                      {!showNewAddress && addresses.length > 0 && (
                        <button onClick={() => setShowNewAddress(true)} className="w-full p-4 rounded-2xl border-2 border-dashed border-primary/20 text-text-muted hover:text-primary hover:border-primary/40 transition-all text-sm font-medium flex items-center justify-center gap-2 cursor-pointer">
                          <span className="material-icons-outlined text-lg">add</span>
                          Add New Address
                        </button>
                      )}

                      {/* New address form */}
                      {showNewAddress && (
                        <div className="bg-surface-dark rounded-2xl border border-primary/10 p-5 sm:p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display font-bold text-text-main-light">New Address</h3>
                            {addresses.length > 0 && (
                              <button onClick={() => setShowNewAddress(false)} className="text-text-muted hover:text-primary transition-colors cursor-pointer">
                                <span className="material-icons-outlined text-lg">close</span>
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { name: 'fullName', label: 'Full Name', placeholder: 'John Doe', full: false },
                              { name: 'phone', label: 'Phone', placeholder: '+91 98765 43210', full: false },
                              { name: 'addressLine1', label: 'Address Line 1', placeholder: '123 Main Street', full: true },
                              { name: 'addressLine2', label: 'Address Line 2', placeholder: 'Apt, Suite (Optional)', full: true },
                              { name: 'city', label: 'City', placeholder: 'Mumbai', full: false },
                              { name: 'state', label: 'State', placeholder: 'Maharashtra', full: false },
                              { name: 'pincode', label: 'Pincode', placeholder: '400001', full: false },
                            ].map(f => (
                              <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">{f.label}</label>
                                <input
                                  name={f.name}
                                  value={(newAddress as any)[f.name] || ''}
                                  onChange={handleNewAddressChange}
                                  placeholder={f.placeholder}
                                  className="w-full bg-background-light border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                                />
                              </div>
                            ))}
                          </div>
                          <button onClick={handleSaveAddress} disabled={savingAddress} className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50">
                            {savingAddress ? 'Saving...' : 'Save Address'}
                          </button>
                        </div>
                      )}

                      {/* Continue */}
                      {addresses.length > 0 && (
                        <button
                          onClick={() => { if (canProceedToReview) setCurrentStep(1) }}
                          disabled={!canProceedToReview}
                          className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-black px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all glow-gold cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          Continue to Review
                          <span className="material-icons-outlined text-lg">arrow_forward</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* STEP 1: Review & Pay */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Delivery address summary */}
                  {selectedAddress && (
                    <div className="bg-surface-dark rounded-2xl border border-primary/10 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display font-bold text-text-main-light flex items-center gap-2 text-sm sm:text-base">
                          <span className="material-icons-outlined text-primary text-lg">location_on</span>
                          Delivering to
                        </h3>
                        <button onClick={() => setCurrentStep(0)} className="text-primary text-xs font-semibold hover:underline cursor-pointer">Change</button>
                      </div>
                      <p className="text-sm text-text-main-light font-medium">{selectedAddress.fullName}</p>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                        {selectedAddress.addressLine1}{selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}, {selectedAddress.city}, {selectedAddress.state} — {selectedAddress.pincode}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">📞 {selectedAddress.phone}</p>
                    </div>
                  )}

                  {/* Order items */}
                  <div className="bg-surface-dark rounded-2xl border border-primary/10 p-5">
                    <h3 className="font-display font-bold text-text-main-light mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <span className="material-icons-outlined text-primary text-lg">shopping_bag</span>
                      Order Items ({items.length})
                    </h3>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-3 sm:gap-4 p-3 rounded-xl bg-background-light border border-primary/5">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-surface-dark overflow-hidden shrink-0 border border-primary/10">
                            {getItemImage(item) ? (
                              <img src={getItemImage(item)!} alt={getItemName(item)} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><span className="material-icons-outlined text-text-muted text-lg">image</span></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-main-light truncate">{getItemName(item)}</p>
                            {getItemVariant(item) && <p className="text-[11px] text-text-muted mt-0.5">{getItemVariant(item)}</p>}
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-text-muted">Qty: {item.quantity}</span>
                              <span className="text-sm font-bold text-primary">{formatPrice(item.lineTotal)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="bg-surface-dark rounded-2xl border border-primary/10 p-5">
                    <h3 className="font-display font-bold text-text-main-light mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <span className="material-icons-outlined text-primary text-lg">local_offer</span>
                      Have a Coupon?
                    </h3>
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); setCouponResult(null) }}
                        placeholder="Enter coupon code"
                        className="flex-1 bg-background-light border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary transition-colors uppercase tracking-wider"
                      />
                      <button
                        onClick={handleValidateCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50 border border-primary/20 shrink-0"
                      >
                        {validatingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponResult?.valid && (
                      <div className="mt-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium flex items-center gap-2">
                        <span className="material-icons-outlined text-sm">check_circle</span>
                        Coupon applied! You save {formatPrice(discountAmount)}
                      </div>
                    )}
                    {couponError && (
                      <div className="mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                        <span className="material-icons-outlined text-sm">error</span>
                        {couponError}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-surface-dark rounded-2xl border border-primary/10 p-5 sm:p-6 sticky top-24">
                <h3 className="font-display font-bold text-text-main-light mb-4 text-sm sm:text-base">Order Summary</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Subtotal ({items.length} items, excl. tax)</span>
                    <span className="text-text-main-light font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {taxTotal !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Tax</span>
                      <span className="text-text-main-light font-medium">{formatPrice(taxTotal)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span className="font-medium">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-muted">Shipping</span>
                    <span className="text-green-400 font-medium text-xs">FREE</span>
                  </div>
                  <div className="border-t border-primary/10 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-text-main-light">Total</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Error */}
                {orderError && (
                  <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <span className="material-icons-outlined text-sm">error</span>
                    {orderError}
                  </div>
                )}

                {/* Place Order */}
                {currentStep === 1 && (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing || !selectedAddressId}
                    className="w-full mt-5 bg-primary hover:bg-primary-hover text-black py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all glow-gold cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {placing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Placing Order...
                      </span>
                    ) : (
                      `Place Order — ${formatPrice(finalTotal)}`
                    )}
                  </button>
                )}

                <div className="mt-4 flex items-center gap-2 text-[10px] text-text-muted/60">
                  <span className="material-icons-outlined text-xs">lock</span>
                  Secure checkout · SSL encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Checkout
