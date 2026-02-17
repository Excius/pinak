import api, { apiRequest, BASE_URL } from "./api";
import { setAccessToken, deleteAccessToken, setRefreshToken, deleteRefreshToken, getRefreshToken } from "@/utils/token";
import axios from 'axios';
import {

    LoginUserResponse,
    RegisterUserResponse,
} from "@repo/types";

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
