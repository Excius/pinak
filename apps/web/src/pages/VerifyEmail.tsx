import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyEmail as apiVerifyEmail } from '../api/auth.api'

type VerificationStatus = 'loading' | 'success' | 'error'

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [processed, setProcessed] = useState(false)

  useEffect(() => {
    if (processed) return

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const verifyEmailToken = async () => {
      try {
        const token = searchParams.get('token')

        if (!token) {
          setErrorMessage('Invalid verification link. Token is missing.')
          setStatus('error')
          setProcessed(true)
          return
        }

        timeoutId = setTimeout(() => {
          if (!processed) {
            setErrorMessage('Verification is taking too long. Please try again.')
            setStatus('error')
            setProcessed(true)
          }
        }, 5000)

        try {
          const data = await apiVerifyEmail({ token })

          if (timeoutId) clearTimeout(timeoutId)

          if (data?.accessToken) {
            try {
              localStorage.setItem('accessToken', data.accessToken)
            } catch { }

            setStatus('success')
            setProcessed(true)
            setTimeout(() => {
              navigate('/')
            }, 2000)
          } else {
            setErrorMessage('Verification failed: No access token received')
            setStatus('error')
            setProcessed(true)
          }
        } catch (apiError: any) {
          if (timeoutId) clearTimeout(timeoutId)

          const msg = apiError?.response?.data?.message || apiError?.message || 'Email verification failed'
          setErrorMessage(msg)
          setStatus('error')
          setProcessed(true)
        }
      } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId)

        const msg = err?.response?.data?.message || err?.message || 'Email verification failed'
        setErrorMessage(msg)
        setStatus('error')
        setProcessed(true)
      }
    }

    verifyEmailToken()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [processed, searchParams, navigate])

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-6 bg-background-light font-body">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Logo */}
        <div className="space-y-4">
          <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <span className="material-icons-outlined text-2xl">spa</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-widest text-primary">PINAK</h1>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
                <span className="material-icons-outlined text-3xl text-primary">mail</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-text-main-light">
                Verifying Email
              </h2>
              <p className="text-text-muted">
                Please wait while we verify your email address...
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-green-900/30 border border-green-800/50">
                <span className="material-icons-outlined text-3xl text-green-400">check_circle</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-text-main-light">
                Email Verified!
              </h2>
              <p className="text-text-muted">
                Your email has been verified successfully. Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-900/30 border border-red-800/50">
                <span className="material-icons-outlined text-3xl text-red-400">error</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-text-main-light">
                Verification Failed
              </h2>
              <p className="text-text-muted mb-4">
                {errorMessage}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-text-muted">
                If the link has expired, you can request a new one.
              </p>
              <button
                className="w-full py-3 px-4 rounded-2xl shadow-lg shadow-primary/20 font-bold text-black bg-primary hover:bg-primary-hover transition-all cursor-pointer active:scale-95"
                onClick={() => navigate('/auth')}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
