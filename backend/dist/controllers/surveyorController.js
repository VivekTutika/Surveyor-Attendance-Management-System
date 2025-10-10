"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyorController = void 0;
const surveyorService_1 = require("../services/surveyorService");
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middlewares/errorHandler");
const db_1 = require("../config/db");
class SurveyorController {
}
exports.SurveyorController = SurveyorController;
_a = SurveyorController;
// POST /api/surveyors - Create new surveyor (Admin only)
SurveyorController.createSurveyor = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const surveyorData = req.body;
    const surveyor = await surveyorService_1.SurveyorService.createSurveyor(surveyorData);
    (0, response_1.sendCreated)(res, 'Surveyor created successfully', surveyor);
});
// GET /api/surveyors - Get all surveyors with filters (Admin only)
SurveyorController.getSurveyors = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const filters = req.query;
    const surveyors = await surveyorService_1.SurveyorService.getSurveyors(filters);
    (0, response_1.sendSuccess)(res, 'Surveyors retrieved successfully', surveyors);
});
// GET /api/surveyors/:id - Get surveyor by ID (Admin only)
SurveyorController.getSurveyorById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const surveyor = await surveyorService_1.SurveyorService.getSurveyorById(parseInt(id));
    (0, response_1.sendSuccess)(res, 'Surveyor retrieved successfully', surveyor);
});
// PUT /api/surveyors/:id - Update surveyor (Admin only)
SurveyorController.updateSurveyor = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedSurveyor = await surveyorService_1.SurveyorService.updateSurveyor(parseInt(id), updateData);
    (0, response_1.sendSuccess)(res, 'Surveyor updated successfully', updatedSurveyor);
});
// DELETE /api/surveyors/:id - Delete surveyor (Admin only)
SurveyorController.deleteSurveyor = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await surveyorService_1.SurveyorService.deleteSurveyor(parseInt(id));
    (0, response_1.sendSuccess)(res, result.message);
});
// POST /api/surveyors/:id/reset-password - Reset surveyor password (Admin only)
SurveyorController.resetSurveyorPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return (0, response_1.sendError)(res, 'Password must be at least 6 characters long', 400);
    }
    const result = await surveyorService_1.SurveyorService.resetSurveyorPassword(parseInt(id), newPassword);
    (0, response_1.sendSuccess)(res, result.message);
});
// GET /api/surveyors/:id/statistics - Get surveyor statistics (Admin only)
SurveyorController.getSurveyorStatistics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const statistics = await surveyorService_1.SurveyorService.getSurveyorStatistics(parseInt(id), startDate, endDate);
    (0, response_1.sendSuccess)(res, 'Surveyor statistics retrieved successfully', statistics);
});
// GET /api/surveyors/projects - Get unique project names (Admin only)
SurveyorController.getProjects = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Get all projects from the dedicated projects table
    const projects = await db_1.prisma.project.findMany({
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
    (0, response_1.sendSuccess)(res, 'Projects retrieved successfully', projects);
});
// GET /api/surveyors/locations - Get unique location names (Admin only)
SurveyorController.getLocations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Get all locations from the dedicated locations table
    const locations = await db_1.prisma.location.findMany({
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
    (0, response_1.sendSuccess)(res, 'Locations retrieved successfully', locations);
});
//# sourceMappingURL=surveyorController.js.map