export interface User {
    _id?: string;
    email: string;
    username: string;
    password: string;
    role: 'admin' | 'cashier';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    role: 'admin' | 'cashier';
}

export interface LoginRequest {
    username: string;
    password: string;
}