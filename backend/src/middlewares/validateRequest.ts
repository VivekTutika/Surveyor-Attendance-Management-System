import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Generic validation middleware factory
export const validateRequest = (schema: {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query) as any;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues.map((err: any) => ({
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

// Common validation schemas
export const schemas = {
  // Auth schemas
  login: {
    body: z.object({
      mobileNumber: z.string().min(10, 'Mobile number must be at least 10 characters'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
  },

  register: {
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      mobileNumber: z.string().min(10, 'Mobile number must be at least 10 characters'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      projectId: z.number().int().positive().optional(),
      locationId: z.number().int().positive().optional(),
      role: z.enum(['ADMIN', 'SURVEYOR']).optional(),
    }),
  },

  // Attendance schemas
  markAttendance: {
    body: z.object({
      type: z.enum(['MORNING', 'EVENING']),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  },

  // Bike meter schemas
  uploadBikeMeter: {
    body: z.object({
      type: z.enum(['MORNING', 'EVENING']),
      kmReading: z.number().positive().optional(),
    }),
  },

  // Surveyor schemas
  createSurveyor: {
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      mobileNumber: z.string().min(10, 'Mobile number must be at least 10 characters'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      projectId: z.number().int().positive().optional(),
      locationId: z.number().int().positive().optional(),
    }),
  },

  updateSurveyor: {
    body: z.object({
      name: z.string().min(2).optional(),
      mobileNumber: z.string().min(10).optional(),
      projectId: z.number().int().positive().optional(),
      locationId: z.number().int().positive().optional(),
      isActive: z.boolean().optional(),
    }),
  },

  // Common schemas
  idParam: {
    params: z.object({
      id: z.string().uuid('Invalid ID format'),
    }),
  },

  idParamInt: {
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), 'Invalid integer ID format'),
    }),
  },

  // Project schemas
  createProject: {
    body: z.object({
      name: z.string().min(2, 'Project name must be at least 2 characters'),
      description: z.string().optional(),
    }),
  },

  updateProject: {
    body: z.object({
      name: z.string().min(2, 'Project name must be at least 2 characters').optional(),
      description: z.string().optional(),
    }),
  },

  // Location schemas
  createLocation: {
    body: z.object({
      name: z.string().min(2, 'Location name must be at least 2 characters'),
    }),
  },

  updateLocation: {
    body: z.object({
      name: z.string().min(2, 'Location name must be at least 2 characters').optional(),
    }),
  },

  dateQuery: {
    query: z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
      userId: z.string().uuid().optional(),
    }),
  },
};