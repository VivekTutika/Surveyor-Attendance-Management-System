import { Request, Response } from 'express';
import { SurveyorService } from '../services/surveyorService';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';
import { prisma } from '../config/db';

export class SurveyorController {
  // POST /api/surveyors - Create new surveyor (Admin only)
  static createSurveyor = asyncHandler(async (req: Request, res: Response) => {
    const surveyorData = req.body;

    const surveyor = await SurveyorService.createSurveyor(surveyorData);

    sendCreated(res, 'Surveyor created successfully', surveyor);
  });

  // GET /api/surveyors - Get all surveyors with filters (Admin only)
  static getSurveyors = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as any;

    const surveyors = await SurveyorService.getSurveyors(filters);

    sendSuccess(res, 'Surveyors retrieved successfully', surveyors);
  });

  // GET /api/surveyors/:id - Get surveyor by ID (Admin only)
  static getSurveyorById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const surveyor = await SurveyorService.getSurveyorById(parseInt(id));

    sendSuccess(res, 'Surveyor retrieved successfully', surveyor);
  });

  // PUT /api/surveyors/:id - Update surveyor (Admin only)
  static updateSurveyor = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSurveyor = await SurveyorService.updateSurveyor(parseInt(id), updateData);

    sendSuccess(res, 'Surveyor updated successfully', updatedSurveyor);
  });

  // DELETE /api/surveyors/:id - Delete surveyor (Admin only)
  static deleteSurveyor = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await SurveyorService.deleteSurveyor(parseInt(id));

    sendSuccess(res, result.message);
  });

  // POST /api/surveyors/:id/reset-password - Reset surveyor password (Admin only)
  static resetSurveyorPassword = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    const result = await SurveyorService.resetSurveyorPassword(parseInt(id), newPassword);

    sendSuccess(res, result.message);
  });

  // GET /api/surveyors/:id/statistics - Get surveyor statistics (Admin only)
  static getSurveyorStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query as any;

    const statistics = await SurveyorService.getSurveyorStatistics(parseInt(id), startDate, endDate);

    sendSuccess(res, 'Surveyor statistics retrieved successfully', statistics);
  });

  // GET /api/surveyors/projects - Get unique project names (Admin only)
  static getProjects = asyncHandler(async (req: Request, res: Response) => {
    // Get all projects from the dedicated projects table
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    sendSuccess(res, 'Projects retrieved successfully', projects);
  });

  // GET /api/surveyors/locations - Get unique location names (Admin only)
  static getLocations = asyncHandler(async (req: Request, res: Response) => {
    // Get all locations from the dedicated locations table
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    sendSuccess(res, 'Locations retrieved successfully', locations);
  });
}