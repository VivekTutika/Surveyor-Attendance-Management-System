import { Request, Response } from 'express';
export declare class BikeController {
    static uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    static uploadBikeMeter: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getBikeMeterList: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getTodayStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateKmReading: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getBikeMeterSummary: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static deleteBikeMeterReading: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=bikeController.d.ts.map