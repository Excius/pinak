import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api/auth.api'

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword({ email })
      setSuccess(true)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send reset instructions'
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
          src="https://images.unsplash.com/photo-1615397323145-64906eb469d7?q=80&w=1471&auto=format&fit=crop"
        />
        {/* Decorative gold glow */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[200px] bg-primary/10 rounded-full blur-[100px] z-10 pointer-events-none"></div>
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-md">
          <div className="h-px w-16 bg-primary mb-6"></div>
          <blockquote className="font-display text-3xl italic leading-relaxed text-white/90">
            "Your beauty journey continues. Let's get you back in."
          </blockquote>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-6 lg:p-8 relative bg-surface-dark">
        {/* Close button */}
        <button
          className="absolute top-6 right-6 text-text-muted hover:text-primary transition-colors cursor-pointer active:scale-95"
          onClick={() => navigate('/auth')}
          aria-label="Back to Login"
        >
          <span className="material-icons-outlined text-2xl">close</span>
        </button>

        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center space-y-1">
            <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary mb-1">
              <span className="material-icons-outlined text-2xl">lock_reset</span>
            </div>
          </div>

          {!success ? (
            <>
              {/* Heading */}
              <div className="space-y-1 text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-text-main-light">
                  Reset Password
                </h2>
                <p className="text-text-muted font-light">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-widest text-text-muted uppercase" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    autoComplete="email"
                    className="w-full px-5 py-3 rounded-2xl border border-primary/15 bg-background-dark text-text-main-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                  disabled={loading}
                >
                  {loading ? (
                    <span className="material-icons-outlined animate-spin text-xl">sync</span>
                  ) : (
                    'Send Instructions'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-green-900/30 border border-green-800/50 text-green-400 mx-auto">
                <span className="material-icons-outlined text-3xl">mark_email_read</span>
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-text-main-light">
                  Check your email
                </h2>
                <p className="text-text-muted font-light leading-relaxed">
                  We have sent password reset instructions to <br />
                  <span className="text-primary font-medium">{email}</span>
                </p>
                <p className="text-xs text-text-muted mt-4">
                  (Check your spam folder if you do not see it within a few minutes)
                </p>
              </div>
              <button
                className="w-full py-3.5 mt-4 rounded-xl border border-primary/20 text-text-main-light hover:text-primary hover:border-primary transition-all font-bold text-sm cursor-pointer"
                onClick={() => navigate('/auth')}
              >
                Return to Login
              </button>
            </div>
          )}

          {/* Back to Login link */}
          {!success && (
            <p className="text-center text-sm text-text-muted mt-8">
              Remembered your password?{' '}
              <a className="font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer" onClick={() => navigate('/auth')}>
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
