import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const AdminLayout = () => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { label: 'Products', path: '/admin/products', icon: 'inventory_2' },
    { label: 'Combo Kits', path: '/admin/combos', icon: 'auto_awesome_mosaic' },
    { label: 'Categories', path: '/admin/categories', icon: 'category' },
    { label: 'Brands', path: '/admin/brands', icon: 'branding_watermark' },
    { label: 'Filters', path: '/admin/filters', icon: 'filter_alt' },
    { label: 'Options', path: '/admin/options', icon: 'tune' },
    { label: 'Featured', path: '/admin/featured', icon: 'star' },
    { label: 'Orders', path: '/admin/orders', icon: 'receipt_long' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
  ]

  return (
    <div className="min-h-screen bg-background-light flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background-main border-r border-primary/10 flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-primary/10">
          <Link to="/" className="font-display text-2xl text-primary font-bold tracking-widest uppercase">
            Pinak
          </Link>
          <span className="ml-2 text-[10px] uppercase font-bold text-primary/50 tracking-widest px-2 py-0.5 rounded border border-primary/20">
            Admin
          </span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]'
                    : 'text-text-muted hover:bg-background-main hover:text-primary'
                }`}
              >
                <span className="material-icons-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-primary/10">
          <div className="flex items-center gap-3 px-4 py-3 bg-background-main rounded-xl mb-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-main-light truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <span className="material-icons-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-background-main/80 backdrop-blur-md border-b border-primary/10 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted font-medium">Admin Workspace</span>
            <span className="text-primary/30">/</span>
            <span className="text-primary font-bold">
              {navItems.find(i => location.pathname === i.path || (i.path !== '/admin' && location.pathname.startsWith(i.path)))?.label || 'Overview'}
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
