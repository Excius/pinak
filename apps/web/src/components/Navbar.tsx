import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import logo from '../assets/logo.png'
import logo1 from '../assets/logo1.png'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()
  const { itemCount, openCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Combos', href: '/combo-kits' },
    { label: 'Wishlist', href: '/wishlist' },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? 'bg-black/95 backdrop-blur-xl border-primary/10 shadow-lg shadow-black/20'
          : 'bg-transparent border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between">

          {/* ── Left: hamburger (mobile) + logo + nav links (desktop) ── */}
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden text-text-main-light cursor-pointer active:scale-95 hover:text-primary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="material-icons-outlined text-[26px]">{mobileOpen ? 'close' : 'menu'}</span>
            </button>

            {/* Small logo — desktop only (left side) */}
            <img
              src={logo}
              alt="Pinak logo"
              className="hidden lg:block h-16 xl:h-20 w-auto brightness-110 cursor-pointer shrink-0 hover:brightness-125 transition-all"
              onClick={() => navigate('/')}
            />

            {/* Desktop nav links with animated underlines */}
            <div className="hidden lg:flex space-x-8 text-sm uppercase tracking-wide font-medium">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  className={`nav-link-underline transition-colors duration-300 cursor-pointer py-1 ${
                    isActive(link.href) ? 'text-primary active' : 'text-text-muted hover:text-primary'
                  }`}
                  onClick={() => navigate(link.href)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Center logo ── */}
          {/* Mobile: small logo centered */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
            <img
              src={logo}
              alt="Pinak"
              className="h-12 sm:h-14 w-auto brightness-110 cursor-pointer hover:brightness-125 transition-all"
              onClick={() => navigate('/')}
            />
          </div>
          {/* Desktop: large logo1 centered */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
            <img
              src={logo1}
              alt="Pinak"
              className="h-36 xl:h-44 w-auto brightness-110 cursor-pointer hover:brightness-125 transition-all"
              onClick={() => navigate('/')}
            />
          </div>

          {/* ── Right: actions ── */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-5">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-all cursor-pointer active:scale-95"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <span className="material-icons-outlined text-[22px]">search</span>
            </button>
            {!isLoading && isAuthenticated ? (
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-all cursor-pointer active:scale-95"
                onClick={() => navigate('/profile')}
                title="Go to profile"
              >
                <span className="material-icons-outlined text-[22px]">person</span>
              </button>
            ) : !isLoading ? (
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-all hidden sm:flex cursor-pointer active:scale-95"
                onClick={() => navigate('/auth')}
                title="Login"
              >
                <span className="material-icons-outlined text-[22px]">person_outline</span>
              </button>
            ) : null}
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-all relative cursor-pointer active:scale-95"
              onClick={openCart}
            >
              <span className="material-icons-outlined text-[22px]">shopping_bag</span>
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary text-black text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold animate-soft-pulse">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu — staggered animation */}
        {mobileOpen && (
          <div className="lg:hidden bg-surface-dark/95 backdrop-blur-xl border-t border-primary/10">
            <div className="max-w-7xl mx-auto px-6 py-5 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  className={`stagger-item flex items-center gap-3 py-3 px-4 rounded-xl text-sm uppercase tracking-wide font-medium cursor-pointer transition-all ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-text-muted hover:text-primary hover:bg-primary/5'
                  }`}
                  onClick={() => {
                    navigate(link.href)
                    setMobileOpen(false)
                  }}
                >
                  <span className="material-icons-outlined text-lg">
                    {link.label === 'Shop' ? 'storefront' : link.label === 'Combos' ? 'redeem' : 'favorite_border'}
                  </span>
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-primary/10 my-2"></div>
              {isAuthenticated ? (
                <a
                  className="stagger-item flex items-center gap-3 py-3 px-4 rounded-xl text-sm uppercase tracking-wide font-medium text-text-muted hover:text-primary hover:bg-primary/5 cursor-pointer transition-all"
                  onClick={() => {
                    navigate('/profile')
                    setMobileOpen(false)
                  }}
                >
                  <span className="material-icons-outlined text-lg">person</span>
                  Profile
                </a>
              ) : (
                <a
                  className="stagger-item flex items-center gap-3 py-3 px-4 rounded-xl text-sm uppercase tracking-wide font-medium text-primary cursor-pointer transition-all hover:bg-primary/5"
                  onClick={() => {
                    navigate('/auth')
                    setMobileOpen(false)
                  }}
                >
                  <span className="material-icons-outlined text-lg">login</span>
                  Login / Sign Up
                </a>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-32 px-4 animate-fadeIn">
          <div className="w-full max-w-2xl glass-card rounded-2xl shadow-2xl shadow-primary/5 p-4 sm:p-6 animate-slideDown">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-display text-base sm:text-lg font-bold text-text-main-light">Search Products</h3>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                onClick={() => setSearchOpen(false)}
              >
                <span className="material-icons-outlined text-xl">close</span>
              </button>
            </div>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-text-muted text-xl">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, categories, brands..."
                  className="w-full pl-12 pr-4 sm:pr-6 py-3 sm:py-4 rounded-xl border border-primary/20 bg-background-light focus:ring-2 focus:ring-primary focus:border-primary focus:shadow-[0_0_20px_rgba(200,169,81,0.1)] outline-none transition-all placeholder-text-muted text-text-main-light text-base sm:text-lg"
                  autoFocus
                />
              </div>
            </form>
            <p className="text-xs text-text-muted/50 mt-3 text-center">Press Enter to search</p>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
