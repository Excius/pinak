import { apiRequest, BASE_URL } from "./api";
import { setAccessToken, deleteAccessToken, setRefreshToken, deleteRefreshToken, getRefreshToken } from "@/utils/token";
import axios from 'axios';
import type { AuthApi } from '@repo/types';


type LoginUserResponse = AuthApi.ResponseTypes['LoginUser'];
type RegisterUserResponse = AuthApi.ResponseTypes['RegisterUser'];
type GoogleOauthUrlResponse = AuthApi.ResponseTypes['GoogleOauth'];
type GoogleOauthCallbackResponse = AuthApi.ResponseTypes['GoogleOauthCallback'];

export async function loginService(email: string, password: string) {
    const loginResponse = await apiRequest<LoginUserResponse>(
        'post',
        '/auth/login',
        { email, password }
    );
    await setAccessToken(loginResponse.data.accessToken);
    if (loginResponse.data.refreshToken) {
        await setRefreshToken(loginResponse.data.refreshToken);
    }
    return loginResponse;
}

export async function signupService(email: string, username: string, password: string) {
    try {
        const payload = {
            email,
            password,
            username,
        };
        console.log("Signup Payload:", payload);

        const registerResponse = await apiRequest<RegisterUserResponse>(
            'post',
            '/auth/register',
            payload
        );

        return registerResponse;
    } catch (error: any) {
        console.error("Signup Error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
        });
        throw error;
    }
}

export async function logoutService() {
    try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
            await axios.post(
                `${BASE_URL}/auth/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }
    } finally {
        await deleteAccessToken();
        await deleteRefreshToken();
    }
}

export async function getGoogleOauthUrlService(platform: 'WEB' | 'MOBILE' = 'MOBILE') {
    return apiRequest<GoogleOauthUrlResponse>('get', '/auth/google', undefined, {
        params: { platform },
    });
}

export async function googleOauthCallbackService(code: string) {
    const oauthResponse = await apiRequest<GoogleOauthCallbackResponse>('post', '/auth/google/callback', {
        code,
        platform: 'MOBILE',
    });

    await setAccessToken(oauthResponse.data.accessToken);
    const refreshToken = (oauthResponse.data as { refreshToken?: string }).refreshToken;
    if (refreshToken) {
        await setRefreshToken(refreshToken);
    }

    return oauthResponse;
}
