import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { getWhatsAppContact, type WhatsAppContact } from '../api/settings.api'

const Footer: React.FC = () => {
  const navigate = useNavigate()
  const [contact, setContact] = useState<WhatsAppContact | null>(null)

  useEffect(() => {
    getWhatsAppContact()
      .then((data) => {
        if (data?.whatsappNumber) setContact(data)
      })
      .catch(() => {})
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openWhatsApp = () => {
    if (!contact?.whatsappNumber) return
    const cleanNumber = contact.whatsappNumber.replace(/[^0-9]/g, '')
    const defaultMsg =
      contact.defaultMessage || 'Hello! I would like to know more about Pinak products.'
    const encodedText = encodeURIComponent(defaultMsg)
    window.open(`https://wa.me/${cleanNumber}?text=${encodedText}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <footer className="relative bg-black pt-0 pb-6 sm:pb-8">
      {/* Gold gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div className="md:col-span-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <img
                src={logo}
                alt="Pinak logo"
                className="h-16 w-auto brightness-110 cursor-pointer hover:brightness-125 transition-all"
                onClick={() => navigate('/')}
              />
            </div>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Affordable premium beauty rooted in Indian traditions. Experience the glow of nature.
            </p>
            <div className="flex space-x-3 justify-center md:justify-start">
              {[
                { icon: 'facebook', label: 'Facebook' },
                { icon: 'photo_camera', label: 'Instagram' },
                { icon: 'alternate_email', label: 'Twitter' },
              ].map((social) => (
                <a
                  key={social.icon}
                  className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_15px_rgba(200,169,81,0.15)] transition-all"
                  href="#"
                  aria-label={social.label}
                >
                  <span className="material-icons-outlined text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-gold-gradient">Shop</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/shop')}>
                  All Products
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/shop')}>
                  Best Sellers
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/combo-kits')}>
                  Combo Kits
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/wishlist')}>
                  Wishlist
                </button>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-gold-gradient">Support</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/stores')}>
                  Store Locator
                </button>
              </li>
              {contact?.whatsappNumber && (
                <li>
                  <button
                    className="hover:text-[#25D366] transition-colors cursor-pointer flex items-center gap-1.5 justify-center md:justify-start"
                    onClick={openWhatsApp}
                  >
                    <span>WhatsApp Concierge</span>
                  </button>
                </li>
              )}
              <li>
                <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/shipping-policy')}>
                  Shipping &amp; Returns
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/orders')}>
                  Track Order
                </button>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-gold-gradient">Company</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/about-us')}>
                  Our Story (About Us)
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/privacy-policy')}>
                  Privacy &amp; Data Security
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/terms-and-conditions')}>
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary/10 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-text-muted gap-4">
          <p>© 2025 Pinak Beauty. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/privacy-policy')}>
              Privacy Policy
            </button>
            <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/terms-and-conditions')}>
              Terms &amp; Conditions
            </button>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-surface-dark border border-primary/20 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(200,169,81,0.15)] transition-all cursor-pointer active:scale-90 group"
        aria-label="Back to top"
      >
        <span className="material-icons-outlined text-xl group-hover:-translate-y-0.5 transition-transform">keyboard_arrow_up</span>
      </button>
    </footer>
  )
}

export default Footer
