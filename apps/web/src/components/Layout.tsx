import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from './CartDrawer'

interface LayoutProps {
  children: React.ReactNode
  hideFooter?: boolean
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter }) => {
  return (
    <div className="bg-background-light text-text-main-light font-body min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <CartDrawer />
    </div>
  )
}

export default Layout
