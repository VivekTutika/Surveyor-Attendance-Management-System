import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}
export declare const sendSuccess: <T>(res: Response, message: string, data?: T, statusCode?: number, meta?: ApiResponse["meta"]) => void;
export declare const sendError: (res: Response, message: string, statusCode?: number, data?: any) => void;
export declare const sendCreated: <T>(res: Response, message: string, data?: T) => void;
export declare const sendBadRequest: (res: Response, message?: string, data?: any) => void;
export declare const sendUnauthorized: (res: Response, message?: string) => void;
export declare const sendForbidden: (res: Response, message?: string) => void;
export declare const sendNotFound: (res: Response, message?: string) => void;
export declare const sendInternalServerError: (res: Response, message?: string) => void;
//# sourceMappingURL=response.d.ts.map