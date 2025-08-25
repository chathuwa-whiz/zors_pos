export interface User {
    _id?: string;
    email: string;
    name: string;
    password: string;
    role: 'admin' | 'cashier';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'cashier';
}