import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { me as apiGetMe, login as apiLogin, signup as apiSignup, logout as apiLogout, googleCallback as apiGoogleCallback } from '../api/auth.api'
import type { LoginPayload, SignupPayload } from '../api/auth.api'

interface User {
  id: string
  email: string
  username: string
  name?: string
  role?: string
  isEmailVerified?: boolean
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  googleLogin: (code: string) => Promise<void>
  signup: (payload: SignupPayload) => Promise<{ verificationPending: boolean }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        setUser(null)
        return
      }
      const response = await apiGetMe()
      const userData = (response as any)?.data || (response as any)?.user || response
      if (userData && typeof userData === 'object' && 'email' in userData) {
        setUser(userData as User)
      } else {
        setUser(null)
      }
    } catch {
      localStorage.removeItem('accessToken')
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await refreshUser()
      setIsLoading(false)
    }
    init()
  }, [refreshUser])

  const login = async (payload: LoginPayload) => {
    const response = await apiLogin(payload)
    const accessToken = (response as any)?.data?.accessToken || response?.accessToken
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
      await refreshUser()
    } else {
      throw new Error('No access token received')
    }
  }

  const googleLogin = async (code: string) => {
    const response = await apiGoogleCallback({ code, platform: 'WEB' })
    const accessToken = (response as any)?.data?.accessToken || response?.accessToken || (response as any)?.accessToken
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
      await refreshUser()
    } else {
      throw new Error('No access token received from Google Login')
    }
  }

  const signup = async (payload: SignupPayload) => {
    await apiSignup(payload)
    return { verificationPending: true }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem('accessToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        googleLogin,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
