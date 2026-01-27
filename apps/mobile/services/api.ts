import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { getAccessToken, deleteAccessToken, setAccessToken } from '@/utils/token';
// import * as SecureStore from 'expo-secure-store';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL


if (!BASE_URL) {
    throw new Error("API URL is not defined in environment variables");
}

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true,
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
            !originalRequest._retry
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
                const refreshResponse = await apiRequest<{ accessToken: string }>('post', '/auth/refresh');
                const newAccessToken = refreshResponse.accessToken;

                await setAccessToken(newAccessToken);
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                await deleteAccessToken();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        const message =
            (error.response?.data as any)?.message ||
            "Something went wrong";

        return Promise.reject(new Error(message));
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

export default api;
