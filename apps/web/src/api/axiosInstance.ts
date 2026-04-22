import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// Track whether a refresh request is in progress to avoid multiple refresh calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: string) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token || '')
    }
  })

  isRefreshing = false
  failedQueue = []
}

// Request interceptor: Add access token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: Handle token refresh on 401
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // If error is 401 (Unauthorized) and not a refresh request, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request to retry after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(axiosInstance(originalRequest))
            },
            reject: (err: any) => reject(err),
          })
        })
      }

      // Mark that we're refreshing
      isRefreshing = true
      originalRequest._retry = true

      try {
        // Call refresh endpoint without auth header to avoid infinite loop
        const refreshResponse = await axios.post(
          `${API_URL}/api/v1/auth/refresh`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            withCredentials: true,
          }
        )

        // Extract new access token from response
        const newAccessToken = refreshResponse.data?.data?.accessToken

        if (newAccessToken) {
          // Save new token to localStorage
          localStorage.setItem('accessToken', newAccessToken)

          // Update authorization header for original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          // Process queued requests with new token
          processQueue(null, newAccessToken)

          // Retry original request with new token
          return axiosInstance(originalRequest)
        } else {
          // No token returned, force logout
          localStorage.removeItem('accessToken')
          processQueue(new Error('No access token received'), null)
          window.location.href = '/auth'
          return Promise.reject(error)
        }
      } catch (refreshError) {
        // Refresh failed, clear token and redirect to login
        localStorage.removeItem('accessToken')
        processQueue(refreshError, null)
        window.location.href = '/auth'
        return Promise.reject(refreshError)
      }
    }

    // For other errors, reject as normal
    return Promise.reject(error)
  }
)

export default axiosInstance
