export interface JWTPayload {
    userId: number;
    mobileNumber: string;
    role: string;
}
export declare const generateToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const decodeToken: (token: string) => JWTPayload | null;
//# sourceMappingURL=jwtUtils.d.ts.map