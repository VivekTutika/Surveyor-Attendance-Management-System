import { Role } from '@prisma/client';
export interface CreateUserData {
    name: string;
    mobileNumber: string;
    password: string;
    role?: Role;
    project?: string;
    location?: string;
}
export interface LoginData {
    mobileNumber: string;
    password: string;
}
export interface AuthResponse {
    user: {
        id: string;
        name: string;
        mobileNumber: string;
        role: Role;
        project: string | null;
        location: string | null;
    };
    token: string;
}
export declare class AuthService {
    static register(userData: CreateUserData): Promise<AuthResponse>;
    static login(loginData: LoginData): Promise<AuthResponse>;
    static getProfile(userId: string): Promise<{
        name: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        project: string | null;
        location: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static updateProfile(userId: string, updateData: {
        name?: string;
        project?: string;
        location?: string;
    }): Promise<{
        name: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        project: string | null;
        location: string | null;
        isActive: boolean;
        updatedAt: Date;
    }>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=authService.d.ts.map