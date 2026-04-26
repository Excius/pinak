import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import GoogleCallback from './pages/GoogleCallback'
import Profile from './pages/Profile'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import CategoryPage from './pages/CategoryPage'
import ComboKits from './pages/ComboKits'
import ComboKitDetail from './pages/ComboKitDetail'
import Wishlist from './pages/Wishlist'
import SearchResults from './pages/SearchResults'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProductList from './pages/admin/products/ProductList'
import AdminProductForm from './pages/admin/products/ProductForm'
import AdminCategoryList from './pages/admin/categories/CategoryList'
import AdminBrandList from './pages/admin/brands/BrandList'
import AdminComboKitList from './pages/admin/combos/ComboKitList'
import AdminComboKitForm from './pages/admin/combos/ComboKitForm'
import AdminFeaturedSections from './pages/admin/featured/FeaturedSectionList'
import AdminSettings from './pages/admin/settings/SettingsPage'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center space-y-4">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
            <span className="material-icons-outlined text-3xl text-primary">spa</span>
          </div>
          <p className="text-text-muted font-body">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

// Admin Protected route wrapper
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center space-y-4">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
            <span className="material-icons-outlined text-3xl text-primary">spa</span>
          </div>
          <p className="text-text-muted font-body">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/api/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
      <Route path="/products/:slug" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
      <Route path="/categories/:slug" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
      <Route path="/combo-kits" element={<ProtectedRoute><ComboKits /></ProtectedRoute>} />
      <Route path="/combo-kits/:slug" element={<ProtectedRoute><ComboKitDetail /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductList />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategoryList />} />
        <Route path="brands" element={<AdminBrandList />} />
        <Route path="combos" element={<AdminComboKitList />} />
        <Route path="combos/new" element={<AdminComboKitForm />} />
        <Route path="combos/:id" element={<AdminComboKitForm />} />
        <Route path="featured" element={<AdminFeaturedSections />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
