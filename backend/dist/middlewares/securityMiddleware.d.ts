import { Request, Response, NextFunction } from 'express';
export declare const rateLimitMiddleware: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestValidation: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=securityMiddleware.d.ts.map