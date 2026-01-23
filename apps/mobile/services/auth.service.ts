import api from "./api";
import { setAccessToken, deleteAccessToken } from "@/utils/token";

export async function login(email: string, password: string) {
    const res = await api.post("/auth/login", {
        email,
        password,
    })

    await setAccessToken(res.data.acessToken)
    return res.data
}

export async function signup(email: string, username: string, password: string) {
    const res = await api.post("'auth/signup", {
        email,
        password,
        username
    })

    await setAccessToken(res.data.accessToken)
}


export async function logout() {
    try {
        await api.post("/logout")

    } finally {
        await deleteAccessToken();

    }
}