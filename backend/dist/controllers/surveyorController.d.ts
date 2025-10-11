import { Request, Response } from 'express';
export declare class SurveyorController {
    static createSurveyor: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getSurveyors: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getSurveyorById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateSurveyor: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static deleteSurveyor: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static resetSurveyorPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getSurveyorStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProjects: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getLocations: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static toggleStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=surveyorController.d.ts.map