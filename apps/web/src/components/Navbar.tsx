import React, { useState } from 'react'
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
      {/* Announcement Bar */}
      <div className="bg-black text-center py-2.5 text-xs uppercase tracking-[0.25em] font-bold border-b border-primary/20">
        <span className="text-primary">✦</span>
        <span className="mx-3 text-primary-light/80">Free Shipping on all orders over ₹750</span>
        <span className="text-primary">✦</span>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-primary/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          {/* Left: logo + nav links */}
          <div className="flex items-center gap-8">
            <img
              src={logo}
              alt="Pinak logo"
              className="h-20 md:h-18 w-auto brightness-110 cursor-pointer shrink-0"
              onClick={() => navigate('/')}
            />
            <button
              className="lg:hidden text-text-main-light cursor-pointer active:scale-95"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="material-icons-outlined">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
            <div className="hidden lg:flex space-x-8 text-sm uppercase tracking-wide font-medium">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  className={`transition-colors duration-300 cursor-pointer ${
                    isActive(link.href) ? 'text-primary' : 'text-text-muted hover:text-primary'
                  }`}
                  onClick={() => navigate(link.href)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Center: logo1 */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <img
              src={logo1}
              alt="Pinak"
              className="h-44 md:h-40 w-auto brightness-110 cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>

          {/* Right: actions */}
          <div className="flex items-center space-x-6">
            <button
              className="text-text-muted hover:text-primary transition-colors cursor-pointer active:scale-95"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <span className="material-icons-outlined">search</span>
            </button>
            {!isLoading && isAuthenticated ? (
              <button
                className="text-text-muted hover:text-primary transition-colors hidden md:block cursor-pointer active:scale-95"
                onClick={() => navigate('/profile')}
                title="Go to profile"
              >
                <span className="material-icons-outlined">person</span>
              </button>
            ) : !isLoading ? (
              <button
                className="text-text-muted hover:text-primary transition-colors hidden md:block cursor-pointer active:scale-95"
                onClick={() => navigate('/auth')}
                title="Login"
              >
                <span className="material-icons-outlined">person_outline</span>
              </button>
            ) : null}
            <button
              className="text-text-muted hover:text-primary transition-colors relative cursor-pointer active:scale-95"
              onClick={openCart}
            >
              <span className="material-icons-outlined">shopping_bag</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-surface-dark border-t border-primary/10 animate-slideDown">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  className={`block text-sm uppercase tracking-wide font-medium cursor-pointer ${
                    isActive(link.href) ? 'text-primary' : 'text-text-muted hover:text-primary'
                  }`}
                  onClick={() => {
                    navigate(link.href)
                    setMobileOpen(false)
                  }}
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated ? (
                <a
                  className="block text-sm uppercase tracking-wide font-medium text-text-muted hover:text-primary cursor-pointer"
                  onClick={() => {
                    navigate('/profile')
                    setMobileOpen(false)
                  }}
                >
                  Profile
                </a>
              ) : (
                <a
                  className="block text-sm uppercase tracking-wide font-medium text-primary cursor-pointer"
                  onClick={() => {
                    navigate('/auth')
                    setMobileOpen(false)
                  }}
                >
                  Login / Sign Up
                </a>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-32 px-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-surface-dark rounded-2xl border border-primary/20 shadow-2xl p-6 animate-slideDown">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-text-main-light">Search Products</h3>
              <button
                className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                onClick={() => setSearchOpen(false)}
              >
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, categories, brands..."
                  className="w-full px-6 py-4 rounded-xl border border-primary/20 bg-background-light focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder-text-muted text-text-main-light text-lg"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover transition-colors cursor-pointer"
                >
                  <span className="material-icons-outlined text-2xl">search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
