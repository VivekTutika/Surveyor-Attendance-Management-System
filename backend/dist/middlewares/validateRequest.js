"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validateRequest = void 0;
const zod_1 = require("zod");
// Generic validation middleware factory
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            if (schema.params) {
                req.params = schema.params.parse(req.params);
            }
            if (schema.query) {
                req.query = schema.query.parse(req.query);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
// Common validation schemas
exports.schemas = {
    // Auth schemas
    login: {
        body: zod_1.z.object({
            mobileNumber: zod_1.z.string().min(10, 'Mobile number must be at least 10 characters'),
            password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        }),
    },
    register: {
        body: zod_1.z.object({
            name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
            mobileNumber: zod_1.z.string().min(10, 'Mobile number must be at least 10 characters'),
            password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
            projectId: zod_1.z.number().int().positive().optional(),
            locationId: zod_1.z.number().int().positive().optional(),
            role: zod_1.z.enum(['ADMIN', 'SURVEYOR']).optional(),
        }),
    },
    // Attendance schemas
    markAttendance: {
        body: zod_1.z.object({
            type: zod_1.z.enum(['MORNING', 'EVENING']),
            latitude: zod_1.z.number().min(-90).max(90),
            longitude: zod_1.z.number().min(-180).max(180),
        }),
    },
    // Bike meter schemas
    uploadBikeMeter: {
        body: zod_1.z.object({
            type: zod_1.z.enum(['MORNING', 'EVENING']),
            kmReading: zod_1.z.number().positive().optional(),
        }),
    },
    // Surveyor schemas
    createSurveyor: {
        body: zod_1.z.object({
            name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
            mobileNumber: zod_1.z.string().min(10, 'Mobile number must be at least 10 characters'),
            password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
            projectId: zod_1.z.number().int().positive().optional(),
            locationId: zod_1.z.number().int().positive().optional(),
        }),
    },
    updateSurveyor: {
        body: zod_1.z.object({
            name: zod_1.z.string().min(2).optional(),
            mobileNumber: zod_1.z.string().min(10).optional(),
            projectId: zod_1.z.number().int().positive().optional(),
            locationId: zod_1.z.number().int().positive().optional(),
            isActive: zod_1.z.boolean().optional(),
        }),
    },
    // Common schemas
    idParam: {
        params: zod_1.z.object({
            id: zod_1.z.string().uuid('Invalid ID format'),
        }),
    },
    idParamInt: {
        params: zod_1.z.object({
            id: zod_1.z.string().refine(val => !isNaN(parseInt(val)), 'Invalid integer ID format'),
        }),
    },
    // Project schemas
    createProject: {
        body: zod_1.z.object({
            name: zod_1.z.string().min(2, 'Project name must be at least 2 characters'),
            description: zod_1.z.string().optional(),
        }),
    },
    updateProject: {
        body: zod_1.z.object({
            name: zod_1.z.string().min(2, 'Project name must be at least 2 characters').optional(),
            description: zod_1.z.string().optional(),
        }),
    },
    // Location schemas
    createLocation: {
        body: zod_1.z.object({
            name: zod_1.z.string().min(2, 'Location name must be at least 2 characters'),
        }),
    },
    updateLocation: {
        body: zod_1.z.object({
            name: zod_1.z.string().min(2, 'Location name must be at least 2 characters').optional(),
        }),
    },
    dateQuery: {
        query: zod_1.z.object({
            date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
            startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
            endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
            userId: zod_1.z.string().uuid().optional(),
        }),
    },
};
//# sourceMappingURL=validateRequest.js.map