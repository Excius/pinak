import api, { apiRequest } from "./api";
import { setAccessToken, deleteAccessToken } from "@/utils/token";
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
        await apiRequest('post', '/auth/logout');
    } finally {
        await deleteAccessToken();
    }
}
