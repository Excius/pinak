import React, { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { googleLogin } = useAuth()
  const processStarted = useRef(false)
  const code = searchParams.get('code')

  useEffect(() => {
    const handleCallback = async () => {
      if (processStarted.current) return
      processStarted.current = true

      if (!code) {
        navigate('/auth', { state: { error: 'No authorization code provided by Google.' } })
        return
      }

      try {
        await googleLogin(code)
        navigate('/')
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to authenticate with Google'
        navigate('/auth', { state: { error: msg } })
      }
    }

    handleCallback()
  }, [code, googleLogin, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light font-body">
      <div className="text-center space-y-4">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
          <span className="material-icons-outlined text-3xl text-primary">spa</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-text-main-light">
          Authenticating
        </h2>
        <p className="text-text-muted font-light">
          Please wait while we securely log you in...
        </p>
      </div>
    </div>
  )
}

export default GoogleCallback
