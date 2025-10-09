import { Request, Response } from 'express';
export declare class AttendanceController {
    static uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    static markAttendance: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getAttendanceList: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getTodayStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getAttendanceSummary: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static deleteAttendance: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=attendanceController.d.ts.map