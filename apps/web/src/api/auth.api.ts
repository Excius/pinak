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

export default {
  login,
  signup,
  verifyEmail,
  me,
  logout,
}
