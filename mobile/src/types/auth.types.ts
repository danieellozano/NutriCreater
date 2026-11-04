export interface RegisterRequest {
    nickname: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    identifier: string;
    password: string;
}


export interface AuthResponse {
    token: string;
    nickname: string;
    email: string;
    role: string;
}

export interface StoredUser {
    nickname: string;
    email: string;
    role: string;
}