import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { signup as apiSignup, getGoogleOAuthUrl, checkUsernameAvailability } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import VerificationPending from './VerificationPending'

const Auth: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(location.state?.error || '')
  const [isVerificationPending, setIsVerificationPending] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [isUsernameChecking, setIsUsernameChecking] = useState(false)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)
  const [usernameError, setUsernameError] = useState<string>('')

  useEffect(() => {
    if (isLogin || !username || username.length < 3) {
      setIsUsernameAvailable(null)
      setIsUsernameChecking(false)
      setUsernameError('')
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsUsernameChecking(true)
      const result = await checkUsernameAvailability(username)
      setIsUsernameAvailable(result.available)
      setUsernameError(result.error || '')
      setIsUsernameChecking(false)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [username, isLogin])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLogin && isUsernameAvailable === false) {
      setError('Please choose an available username.')
      return
    }
    setError('')
    setLoading(true)
    const run = async () => {
      try {
        if (isLogin) {
          await login({ email, password })
          navigate('/')
        } else {
          await apiSignup({ email, password, username })
          setSignupEmail(email)
          setIsVerificationPending(true)
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Authentication failed'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    run()
  }

  const handleGoogleLogin = async () => {
    try {
      const response = await getGoogleOAuthUrl('WEB')
      if (response && response.url) {
        window.location.href = response.url
      }
    } catch (err: any) {
      setError('Failed to initiate Google Login')
    }
  }

  if (isVerificationPending) {
    return (
      <VerificationPending
        email={signupEmail}
        onBackToLogin={() => {
          setIsVerificationPending(false)
          setIsLogin(true)
          setEmail('')
          setPassword('')
          setUsername('')
          setError('')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background-light font-body">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img
          alt="Serene woman with glowing skin holding a botanical element"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJCBaeEzJN31hfTZRPimT8Xu6WF__Y1q8AzH4_WifihCq-ctIa1aETrcZk76mLDFeWbLJyuTDQYQO1nu0jVaRrSV1dCbBRCSQV4aiVwzltM13_et5kSJUqrWtMGsh28_zehzJInb6BI4iW0SuC9Ou7IE1uYsaXvwA_WBCrGhKVPxrKgvb5g32k6chh-uQcKRtTq2KCXE8kN4XzsvpUpIej8FefHFWRGoAYeYaFbCoH0K5HbyI0aCKpMZC0LyxXjgV9i_kX0AvqYQ"
        />
        {/* Decorative gold glow */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[200px] bg-primary/10 rounded-full blur-[100px] z-10 pointer-events-none"></div>
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-md">
          <div className="h-px w-16 bg-primary mb-6"></div>
          <blockquote className="font-display text-3xl italic leading-relaxed text-white/90">
            "Beauty is a ritual, not a routine. Discover the <span className="text-primary">glow</span> within."
          </blockquote>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-8 lg:p-8 relative bg-surface-dark">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        {/* Close button */}
        <button
          className="absolute top-6 right-6 text-text-muted hover:text-primary transition-colors cursor-pointer active:scale-95"
          onClick={() => navigate('/')}
          aria-label="Close"
        >
          <span className="material-icons-outlined text-2xl">close</span>
        </button>

        <div className="w-full max-w-md space-y-6 relative z-10">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="gradient-ring inline-block">
              <div className="w-14 h-14 rounded-full bg-surface-dark flex items-center justify-center text-primary">
                <span className="material-icons-outlined text-2xl">spa</span>
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-widest text-gold-gradient">PINAK</h1>
          </div>

          {/* Tabs */}
          <div className="bg-background-dark p-1 rounded-full flex relative border border-primary/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${isLogin
                  ? 'shadow-sm bg-primary text-black'
                  : 'text-text-muted hover:text-primary'
                } cursor-pointer active:scale-95`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${!isLogin
                  ? 'shadow-sm bg-primary text-black'
                  : 'text-text-muted hover:text-primary'
                } cursor-pointer active:scale-95`}
            >
              Sign Up
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-text-main-light">
              {isLogin ? 'Welcome back' : 'Join us'}
            </h2>
            <p className="text-text-muted font-light">
              {isLogin ? 'Experience the ritual of expert-led beauty.' : 'Discover beauty the Pinak way.'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Username (Sign Up only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold tracking-widest text-text-muted uppercase" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-text-muted text-lg">person</span>
                  <input
                    className={`w-full pl-11 pr-12 py-3 rounded-2xl border ${isUsernameAvailable === false ? 'border-red-500/50 focus:ring-red-500' : isUsernameAvailable === true ? 'border-green-500/50 focus:ring-green-500' : 'border-primary/15 focus:ring-primary'} bg-background-dark text-text-main-light placeholder-text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm`}
                    id="username"
                    name="username"
                    placeholder="Choose a username"
                    required={!isLogin}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    {isUsernameChecking && <span className="material-icons-outlined text-text-muted animate-spin text-xl">sync</span>}
                    {!isUsernameChecking && isUsernameAvailable === true && <span className="material-icons-outlined text-green-400 text-xl">check_circle</span>}
                    {!isUsernameChecking && isUsernameAvailable === false && <span className="material-icons-outlined text-red-400 text-xl">cancel</span>}
                  </div>
                </div>
                {!isUsernameChecking && isUsernameAvailable === false && usernameError && (
                  <p className="text-xs text-red-400 mt-1">{usernameError}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold tracking-widest text-text-muted uppercase" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-text-muted text-lg">email</span>
                <input
                  autoComplete="email"
                  className="w-full pl-11 pr-5 py-3 rounded-2xl border border-primary/15 bg-background-dark text-text-main-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold tracking-widest text-text-muted uppercase" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-text-muted text-lg">lock</span>
                <input
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="w-full pl-11 pr-12 py-3 rounded-2xl border border-primary/15 bg-background-dark text-text-main-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-800/50">
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end -mt-1">
                <a 
                  href="/forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/forgot-password');
                  }}
                  className="text-sm font-medium text-primary hover:text-primary-hover underline decoration-transparent hover:decoration-current transition-all cursor-pointer"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-primary/20 text-sm font-bold text-black bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-[0.98] cursor-pointer glow-gold"
              type="submit"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/10"></div>
            </div>
            <div className="relative bg-surface-dark px-4 text-sm italic text-text-muted font-display">
              or
            </div>
          </div>

          {/* Google Sign-in */}
          <button
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-primary/15 rounded-2xl bg-background-dark text-text-main-light font-bold hover:bg-surface-elevated hover:border-primary/30 transition-colors shadow-sm cursor-pointer active:scale-95"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 4.63c1.69 0 3.26.58 4.54 1.8l3.41-3.41C17.96 1.05 15.17 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>

          {/* Sign up / Login link */}
          <p className="text-center text-sm text-text-muted mt-4">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <a className="font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up now' : 'Login'}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
