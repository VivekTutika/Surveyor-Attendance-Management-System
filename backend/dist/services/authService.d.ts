import { Role } from '@prisma/client';
export interface CreateUserData {
    name: string;
    mobileNumber: string;
    password: string;
    role?: Role;
    projectId?: number;
    locationId?: number;
}
export interface LoginData {
    mobileNumber: string;
    password: string;
}
export interface AuthResponse {
    user: {
        id: number;
        name: string;
        mobileNumber: string;
        role: Role;
        projectId: number | null;
        locationId: number | null;
        project?: {
            id: number;
            name: string;
        } | null;
        location?: {
            id: number;
            name: string;
        } | null;
    };
    token: string;
}
export declare class AuthService {
    static register(userData: CreateUserData): Promise<AuthResponse>;
    static login(loginData: LoginData): Promise<AuthResponse>;
    static getProfile(userId: number): Promise<{
        name: string;
        project: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        isActive: boolean;
        location: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
    static updateProfile(userId: number, updateData: {
        name?: string;
    }): Promise<{
        name: string;
        project: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        isActive: boolean;
        location: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
    static changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=authService.d.ts.map