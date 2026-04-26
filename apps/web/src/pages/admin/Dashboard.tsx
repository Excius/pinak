import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const { user } = useAuth()

  const quickLinks = [
    { title: 'Manage Products', icon: 'inventory_2', path: '/admin/products', desc: 'Add or update your inventory' },
    { title: 'Combo Kits', icon: 'auto_awesome_mosaic', path: '/admin/combos', desc: 'Curate product bundles' },
    { title: 'Categories', icon: 'category', path: '/admin/categories', desc: 'Organize store taxonomy' },
    { title: 'Featured Sections', icon: 'star', path: '/admin/featured', desc: 'Update homepage highlights' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-background-light rounded-2xl p-8 border border-primary/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-bold text-text-main-light mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-text-muted">
            Here's what's happening in your store today. Select a module from the sidebar to start managing your catalog.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="bg-background-light p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-2xl">{link.icon}</span>
              </div>
              <h3 className="font-bold text-text-main-light mb-1">{link.title}</h3>
              <p className="text-xs text-text-muted">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-light rounded-2xl border border-primary/10 p-6">
          <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-6 flex items-center gap-2">
            <span className="material-icons-outlined text-lg">insights</span>
            System Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-background-light border border-primary/5">
              <span className="font-medium text-text-main-light text-sm">API Connection</span>
              <span className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-background-light border border-primary/5">
              <span className="font-medium text-text-main-light text-sm">Database Sync</span>
              <span className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Synced
              </span>
            </div>
          </div>
        </div>

        <div className="bg-background-light rounded-2xl border border-primary/10 p-6 flex flex-col items-center justify-center text-center text-text-muted space-y-4">
          <span className="material-icons-outlined text-4xl text-primary/20">query_stats</span>
          <p className="text-sm">Store analytics and revenue charts will be available in the upcoming analytics module update.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
