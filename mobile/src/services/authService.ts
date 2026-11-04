import {API_BASE_URL} from './client';
import {LoginRequest, RegisterRequest, AuthResponse} from '../types/';

const BASE_URL = `${API_BASE_URL}/auth`;

export const authService = {
    // Register a new user
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }); 

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Error al registrar usuario`);

        }
        return response.json();
    },

    // Login a user
    async login(data: LoginRequest): Promise<AuthResponse>{
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }); 
        
        if (!response.ok){
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Error al iniciar sesión`);
        }

        return response.json();
    },
}
