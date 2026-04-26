import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyPassword } from '../api/auth.api'

const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    try {
      await verifyPassword({ token, newPassword })
      setSuccess(true)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to reset password. Your token may have expired.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background-light font-body">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-surface-dark">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          alt="Serene elements or botanical"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1471&auto=format&fit=crop"
        />
        {/* Decorative gold glow */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[200px] bg-primary/10 rounded-full blur-[100px] z-10 pointer-events-none"></div>
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-md">
          <div className="h-px w-16 bg-primary mb-6"></div>
          <blockquote className="font-display text-3xl italic leading-relaxed text-white/90">
            "A fresh start. Secure your account and discover the <span className="text-primary">glow</span> within."
          </blockquote>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-6 lg:p-8 relative bg-surface-dark">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center space-y-1">
            <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary mb-1">
              <span className="material-icons-outlined text-2xl">key</span>
            </div>
          </div>

          {!success ? (
            <>
              {/* Heading */}
              <div className="space-y-1 text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-text-main-light">
                  Set new password
                </h2>
                <p className="text-text-muted font-light">
                  Please enter your new password below.
                </p>
              </div>

              {!token && (
                <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/30 text-center mb-6">
                  <span className="material-icons-outlined text-red-400 text-3xl mb-2">warning</span>
                  <p className="text-sm text-red-200">
                    Missing reset token. Please click the exact link from your email.
                  </p>
                </div>
              )}

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-widest text-text-muted uppercase" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-5 py-3 rounded-2xl border border-primary/15 bg-background-dark text-text-main-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                      id="newPassword"
                      name="newPassword"
                      placeholder="Enter new password"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-primary transition-colors cursor-pointer active:scale-95"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      <span className="material-icons-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-widest text-text-muted uppercase" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-5 py-3 rounded-2xl border border-primary/15 bg-background-dark text-text-main-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-900/30 border border-red-800/50">
                    <p className="text-sm text-red-400 font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-primary/20 text-sm font-bold text-black bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-[0.98] cursor-pointer glow-gold mt-6"
                  type="submit"
                  disabled={loading || !token}
                >
                  {loading ? (
                    <span className="material-icons-outlined animate-spin text-xl">sync</span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-green-900/30 border border-green-800/50 text-green-400 mx-auto">
                <span className="material-icons-outlined text-3xl">check_circle</span>
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-text-main-light">
                  Password Updated
                </h2>
                <p className="text-text-muted font-light leading-relaxed">
                  Your password has been successfully reset. You can now use your new password to log in.
                </p>
              </div>
              <button
                className="w-full py-3.5 mt-4 rounded-xl border border-transparent bg-primary text-black hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 font-bold text-sm cursor-pointer"
                onClick={() => navigate('/auth')}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
