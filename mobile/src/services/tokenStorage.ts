import * as SecureStore from 'expo-secure-store';
import {StoredUser} from '../types';

const TOKEN_KEY = 'nutri_auth_token';
const USER_KEY = 'nutri_user_data';

export const tokenStorage = {
    // Guardar el token y los datos del usuario en el almacenamiento seguro.
    async saveAuthData(token: string, user: StoredUser): Promise<void> {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    },

    // Obtener el token guardado
    async getToken(): Promise<string | null> {
        return SecureStore.getItemAsync(TOKEN_KEY);
    },

    // Obtener el usuario guardado
    async getUser(): Promise<StoredUser | null> {
        const rawUser = await SecureStore.getItemAsync(USER_KEY);
        if (!rawUser) 
            return null;
        try {
            return JSON.parse(rawUser) as StoredUser;
        } catch {
            return null;
        }
    },
    
    // Borrar sesión (Logout)
    async clearAuthData(): Promise<void> {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    },
};
