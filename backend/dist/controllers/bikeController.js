"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BikeController = void 0;
const multer_1 = __importDefault(require("multer"));
const bikeService_1 = require("../services/bikeService");
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middlewares/errorHandler");
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
});
class BikeController {
}
exports.BikeController = BikeController;
_a = BikeController;
// Multer middleware for photo upload
BikeController.uploadMiddleware = upload.single('photo');
// POST /api/bike/upload - Upload bike meter reading with photo
BikeController.uploadBikeMeter = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { type, kmReading } = req.body;
    const photoFile = req.file;
    if (!photoFile) {
        return (0, response_1.sendError)(res, 'Photo is required for bike meter reading', 400);
    }
    if (!photoFile.buffer) {
        return (0, response_1.sendError)(res, 'Invalid photo file', 400);
    }
    const bikeMeterData = {
        userId,
        type,
        photoBuffer: photoFile.buffer,
        kmReading: kmReading ? parseFloat(kmReading) : undefined,
    };
    const bikeMeterReading = await bikeService_1.BikeService.uploadBikeMeterReading(bikeMeterData);
    (0, response_1.sendCreated)(res, 'Bike meter reading uploaded successfully', bikeMeterReading);
});
// GET /api/bike/list - Get bike meter readings with filters
BikeController.getBikeMeterList = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userRole = req.user.role;
    const requestingUserId = req.user.id;
    const filters = req.validatedQuery || req.query;
    const bikeMeterReadings = await bikeService_1.BikeService.getBikeMeterReadings(filters, userRole, requestingUserId);
    (0, response_1.sendSuccess)(res, 'Bike meter readings retrieved successfully', bikeMeterReadings);
});
// GET /api/bike/today - Get today's bike meter reading status
BikeController.getTodayStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId) : req.user.id;
    // If not admin and trying to access another user's data
    if (req.user.role !== 'ADMIN' && userId !== req.user.id) {
        return (0, response_1.sendError)(res, 'Access denied. You can only view your own bike meter readings.', 403);
    }
    const status = await bikeService_1.BikeService.getTodayBikeMeterStatus(userId);
    (0, response_1.sendSuccess)(res, 'Today\'s bike meter status retrieved successfully', status);
});
// PUT /api/bike/:id/km-reading - Update KM reading manually (Admin only)
BikeController.updateKmReading = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { kmReading } = req.body;
    if (!kmReading || kmReading <= 0) {
        return (0, response_1.sendError)(res, 'Valid KM reading is required', 400);
    }
    const updatedReading = await bikeService_1.BikeService.updateKmReading(id, parseFloat(kmReading));
    (0, response_1.sendSuccess)(res, 'KM reading updated successfully', updatedReading);
});
// GET /api/bike/summary - Get bike meter summary for date range
BikeController.getBikeMeterSummary = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId, startDate, endDate } = req.validatedQuery || req.query;
    const targetUserId = userId ? parseInt(userId) : req.user.id;
    // If not admin and trying to access another user's data
    if (req.user.role !== 'ADMIN' && targetUserId !== req.user.id) {
        return (0, response_1.sendError)(res, 'Access denied. You can only view your own bike meter readings.', 403);
    }
    if (!startDate || !endDate) {
        return (0, response_1.sendError)(res, 'Start date and end date are required', 400);
    }
    const summary = await bikeService_1.BikeService.getBikeMeterSummary(targetUserId, startDate, endDate);
    (0, response_1.sendSuccess)(res, 'Bike meter summary retrieved successfully', summary);
});
// DELETE /api/bike/:id - Delete bike meter reading (Admin only)
BikeController.deleteBikeMeterReading = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await bikeService_1.BikeService.deleteBikeMeterReading(id);
    (0, response_1.sendSuccess)(res, result.message);
});
//# sourceMappingURL=bikeController.js.map