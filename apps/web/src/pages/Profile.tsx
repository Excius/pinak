import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!authUser) {
      navigate('/auth')
      return
    }
    setUser(authUser as User)
    setLoading(false)
  }, [authUser, authLoading, navigate])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/auth')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Logout failed'
      setError(msg)
    }
  }

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
            <div className="bg-surface-dark rounded-2xl shadow-sm p-8 text-center space-y-6 sticky top-6 border border-primary/10">
              {/* Avatar */}
              <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 text-primary">
                <span className="material-icons-outlined text-5xl">person</span>
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
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-xs text-text-muted">Orders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">₹450</p>
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

            {/* Recent Orders */}
            <div className="bg-surface-dark rounded-2xl shadow-sm p-8 border border-primary/10">
              <h3 className="font-display text-xl font-bold text-text-main-light mb-6">
                Recent Orders
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-primary/10 rounded-lg hover:bg-surface-elevated hover:border-primary/20 transition-colors">
                  <div>
                    <p className="font-semibold text-text-main-light">Order #1234</p>
                    <p className="text-sm text-text-muted">Jan 15, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹125.00</p>
                    <p className="text-xs text-green-400 font-semibold">Delivered</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-primary/10 rounded-lg hover:bg-surface-elevated hover:border-primary/20 transition-colors">
                  <div>
                    <p className="font-semibold text-text-main-light">Order #1233</p>
                    <p className="text-sm text-text-muted">Jan 8, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹89.50</p>
                    <p className="text-xs text-green-400 font-semibold">Delivered</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-3 px-4 rounded-lg border border-primary/30 text-primary hover:bg-primary hover:text-black transition-all font-semibold cursor-pointer active:scale-95">
                View All Orders
              </button>
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
                  <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer accent-primary" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                  <div>
                    <p className="font-semibold text-text-main-light">Marketing Emails</p>
                    <p className="text-sm text-text-muted">New products and offers</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 cursor-pointer accent-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
