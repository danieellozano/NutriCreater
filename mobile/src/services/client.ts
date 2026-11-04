import {tokenStorage} from './tokenStorage';

export const API_BASE_URL = 'http://192.168.1.119:8080/api';

/**
 * Devuelve las cabeceras HTTP incluyendo el Token JwT si existe
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await tokenStorage.getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };      

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }


    return headers;
}