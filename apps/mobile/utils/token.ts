import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = "acessToken";

export async function getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<void> {
    return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function deleteAccessToken(): Promise<void> {
    return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
}