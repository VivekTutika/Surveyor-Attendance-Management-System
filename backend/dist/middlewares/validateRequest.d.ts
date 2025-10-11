import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const validateRequest: (schema: {
    body?: z.ZodSchema;
    params?: z.ZodSchema;
    query?: z.ZodSchema;
}) => (req: Request, res: Response, next: NextFunction) => void;
export declare const schemas: {
    login: {
        body: z.ZodObject<{
            mobileNumber: z.ZodString;
            password: z.ZodString;
        }, z.core.$strip>;
    };
    register: {
        body: z.ZodObject<{
            name: z.ZodString;
            mobileNumber: z.ZodString;
            password: z.ZodString;
            projectId: z.ZodOptional<z.ZodNumber>;
            locationId: z.ZodOptional<z.ZodNumber>;
            role: z.ZodOptional<z.ZodEnum<{
                ADMIN: "ADMIN";
                SURVEYOR: "SURVEYOR";
            }>>;
        }, z.core.$strip>;
    };
    markAttendance: {
        body: z.ZodObject<{
            type: z.ZodEnum<{
                MORNING: "MORNING";
                EVENING: "EVENING";
            }>;
            latitude: z.ZodCoercedNumber<unknown>;
            longitude: z.ZodCoercedNumber<unknown>;
        }, z.core.$strip>;
    };
    uploadBikeMeter: {
        body: z.ZodObject<{
            type: z.ZodEnum<{
                MORNING: "MORNING";
                EVENING: "EVENING";
            }>;
            kmReading: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
    };
    createSurveyor: {
        body: z.ZodObject<{
            name: z.ZodString;
            mobileNumber: z.ZodString;
            password: z.ZodString;
            projectId: z.ZodOptional<z.ZodNumber>;
            locationId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    };
    updateSurveyor: {
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            mobileNumber: z.ZodOptional<z.ZodString>;
            projectId: z.ZodOptional<z.ZodNumber>;
            locationId: z.ZodOptional<z.ZodNumber>;
            isActive: z.ZodOptional<z.ZodBoolean>;
            hasBike: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
    };
    idParam: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    idParamAny: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    idParamInt: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    createProject: {
        body: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    updateProject: {
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    createLocation: {
        body: z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>;
    };
    updateLocation: {
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    dateQuery: {
        query: z.ZodObject<{
            date: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
};
//# sourceMappingURL=validateRequest.d.ts.map