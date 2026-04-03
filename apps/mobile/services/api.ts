import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { getAccessToken, deleteAccessToken, setAccessToken, getRefreshToken, setRefreshToken, deleteRefreshToken } from '@/utils/token';
// import * as SecureStore from 'expo-secure-store';
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL


if (!BASE_URL) {
    throw new Error("API URL is not defined in environment variables");
}

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})
// interceptor to attach access token
api.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }


        return config
    },
    (error) => Promise.reject(error)
)

// interceptorfor 401->refresh->retry

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<any>) => {
        const originalRequest: any = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh')
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            isRefreshing = true;

            try {
                const refreshToken = await getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                const refreshResponse = await axios.post<{ message: string; success: boolean; data: { accessToken: string; refreshToken: string } }>(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                const newAccessToken = refreshResponse.data.data.accessToken;
                const newRefreshToken = refreshResponse.data.data.refreshToken;

                await setAccessToken(newAccessToken);
                await setRefreshToken(newRefreshToken);
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                await deleteAccessToken();
                await deleteRefreshToken();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle different error scenarios
        let message = "Something went wrong";

        if (!error.response) {
            // Network error - no response from server
            message = "Network error. Please check your connection.";
        } else if (error.response.status >= 500) {
            // Server error
            message = "Server error. Please try again later.";
        } else if (error.response.data?.message) {
            // API returned an error message
            message = error.response.data.message;
        } else if (error.response.status === 400) {
            message = "Invalid request. Please check your input.";
        } else if (error.response.status === 403) {
            message = "Access denied.";
        } else if (error.response.status === 404) {
            message = "Resource not found.";
        }

        // Create error with response attached for upstream handlers
        const apiError = new Error(message);
        (apiError as any).response = error.response;
        (apiError as any).status = error.response?.status;

        return Promise.reject(apiError);
    }
);

export async function apiRequest<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
    config?: any
): Promise<T> {
    const response: AxiosResponse<T> = await api[method](url, data, config);
    return response.data;
}

// export default api;
