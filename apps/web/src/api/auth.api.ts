import axiosInstance from './axiosInstance'

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  email: string
  password: string
  username: string
}

export interface VerifyEmailPayload {
  token: string
}

export interface AuthResponse {
  accessToken?: string
  refreshToken?: string
  user?: Record<string, any>
}

export interface VerifyEmailResponse {
  accessToken: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface VerifyPasswordPayload {
  token: string
  newPassword: string
}

export interface GoogleCallbackPayload {
  code: string
  platform?: 'WEB' | 'MOBILE'
}

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post('/auth/login', payload)
  return data
}

export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post('/auth/register', payload)
  return data
}

export const verifyEmail = async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
  const { data } = await axiosInstance.post('/auth/verify-email', payload)
  return data.data
}

export const me = async (): Promise<AuthResponse> => {
  const { data } = await axiosInstance.get('/auth/me')
  return data
}

export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout')
}

export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
  const { data } = await axiosInstance.post('/auth/forgot-password', payload)
  return data
}

export const verifyPassword = async (payload: VerifyPasswordPayload): Promise<{ message: string }> => {
  const { data } = await axiosInstance.post('/auth/verify-password', payload)
  return data
}

export const getGoogleOAuthUrl = async (platform: string = 'WEB'): Promise<{ url: string }> => {
  const { data } = await axiosInstance.get(`/auth/google?platform=${platform}`)
  return data.data
}

export const googleCallback = async (payload: GoogleCallbackPayload): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post('/auth/google/callback', payload)
  return data.data || data
}

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const { data } = await axiosInstance.get(`/auth/username?username=${encodeURIComponent(username)}`)
    return data.success
  } catch (error) {
    return false
  }
}

export default {
  login,
  signup,
  verifyEmail,
  me,
  logout,
  forgotPassword,
  verifyPassword,
  getGoogleOAuthUrl,
  googleCallback,
  checkUsernameAvailability,
}
