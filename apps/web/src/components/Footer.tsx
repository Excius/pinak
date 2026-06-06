import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

const Footer: React.FC = () => {
  const navigate = useNavigate()

  return (
    <footer className="bg-black pt-16 pb-8 border-t border-primary/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img
                src={logo}
                alt="Pinak logo"
                className="h-16 w-auto brightness-110 cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Affordable premium beauty rooted in Indian traditions. Experience the glow of nature.
            </p>
            <div className="flex space-x-4">
              <a className="text-text-muted hover:text-primary transition-colors" href="#">
                <span className="material-icons-outlined">facebook</span>
              </a>
              <a className="text-text-muted hover:text-primary transition-colors" href="#">
                <span className="material-icons-outlined">photo_camera</span>
              </a>
              <a className="text-text-muted hover:text-primary transition-colors" href="#">
                <span className="material-icons-outlined">alternate_email</span>
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-primary-light">Shop</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <a className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/shop')}>
                  All Products
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/shop')}>
                  Best Sellers
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/combo-kits')}>
                  Combo Kits
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/wishlist')}>
                  Wishlist
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-primary-light">Support</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><a className="hover:text-primary transition-colors" href="#">Contact Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Shipping &amp; Returns</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">FAQ</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Track Order</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-primary-light">Company</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><a className="hover:text-primary transition-colors" href="#">Our Story</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Sustainability</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Ingredients</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-text-muted">
          <p>© 2025 Pinak Beauty. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
