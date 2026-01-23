import api from "./api";
import { setAccessToken, deleteAccessToken } from "@/utils/token";

export async function login(email: string, password: string) {
    const res = await api.post("/auth/login", {
        email,
        password,
    });

    await setAccessToken(res.data.data.accessToken);
    return res.data;
}

export async function signup(email: string, username: string, password: string) {
    try {
        const payload = {
            email,
            password,
            username,
        };
        console.log("Signup Payload:", payload);

        const res = await api.post("/auth/register", payload);

        // Extract the token from the nested data object
        const accessToken = res.data.data.accessToken;
        if (typeof accessToken !== "string") {
            throw new Error("Invalid token format received");
        }

        await setAccessToken(accessToken);
        return res.data;
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

export async function logout() {
    try {
        await api.post("/auth/logout");
    } finally {
        await deleteAccessToken();
    }
}
